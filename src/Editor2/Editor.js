import actions from "./actions"
import computePosRange from "./computePosRange"
import EditorContext from "./EditorContext"
import keyCodes from "./keyCodes"
import parse from "./parser"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
import syncPos from "./syncPos"
import syncTrees from "./syncTrees"
import typeMap from "./typeMap"
import uuidv4 from "uuid/v4"

const DEBUG_MODE = true && process.env.NODE_ENV !== "production"

// Creates an extended cursor ID (root ID) range.
function extendPosRange(state, [pos1, pos2]) {
	let startIndex = state.data.findIndex(each => each.id === pos1.root.id)
	startIndex -= 2 // Decrement 2x
	if (startIndex < 0) {
		startIndex = 0
	}
	let endIndex = state.data.findIndex(each => each.id === pos2.root.id)
	endIndex += 2 // Increment 2x
	if (endIndex >= state.data.length) {
		endIndex = state.data.length - 1
	}
	return [state.data[startIndex].id, state.data[endIndex].id]
}

// Queries data-root elements.
function queryRoots(editorRoot, extPosRange) {
	// Query the start root:
	const root1 = document.getElementById(extPosRange[0])
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error("queryRoots: no such root1 or out of bounds")
	}
	// Query the end root:
	let root2 = document.getElementById(extPosRange[1])
	let root2AtEnd = false
	// Guard enter pressed on root2:
	const nextRoot = root2 && root2.nextElementSibling
	if (nextRoot && nextRoot.getAttribute("data-root") && (!nextRoot.id || nextRoot.id === root2.id)) {
		nextRoot.id = uuidv4() // Correct the ID
		root2 = nextRoot
		root2AtEnd = true
	// Guard backspaced pressed on root2:
	} else if (!root2) {
		root2 = editorRoot.children[editorRoot.children.length - 1]
		root2AtEnd = true
	}
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error("queryRoots: no such root2 or out of bounds")
	}
	return { roots: [root1, root2], root2AtEnd }
}

const Document = ({ data }) => (
	data.map(({ type: T, ...props }) => (
		React.createElement(typeMap[T], {
			key: props.id,
			...props,
		})
	))
)

;(() => {
	document.body.classList.toggle("debug-css")
})()

const Editor = ({ id, tag, state, setState }) => {
	const ref = React.useRef()

	const pointerDownRef = React.useRef()

	// Renders to the DOM.
	const mounted = React.useRef()
	React.useLayoutEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document data={state.data} />, state.reactDOM, () => {
				// Sync user-managed DOM to the React-managed DOM:
				const mutations = syncTrees(state.reactDOM, ref.current)
				if (!mounted.current) {
					mounted.current = true
					return
				}
				if (mutations) {
					console.log(`syncTrees: ${mutations} mutation${!mutations ? "" : "s"}`)
				}
				// Sync DOM cursors to the VDOM cursors:
				const syncedPos = syncPos(ref.current, [state.pos1, state.pos2])
				if (syncedPos) {
					console.log("syncPos")
				}
				// Update extPosRange for edge-cases such as
				// forward-backspace:
				const [pos1, pos2] = computePosRange(ref.current)
				const extPosRange = extendPosRange(state, [pos1, pos2])
				setState(current => ({
					...current,
					pos1,
					pos2,
					extPosRange,
				}))
			})
		}, [state, setState]),
		[state.data],
	)

	// TODO: Register props e.g. readOnly
	const { Provider } = EditorContext
	return (
		<Provider value={[state, setState]}>
			<div>

				{React.createElement(
					tag || "div",
					{
						ref,

						id,

						style: {
							// NOTE: Imperative styles needed because of
							// contenteditable
							whiteSpace: "pre-wrap",
							outline: "none",
							overflowWrap: "break-word",
						},

						onFocus: () => setState(current => ({ ...current, focused: true })),
						onBlur:  () => setState(current => ({ ...current, focused: false })),

						onSelect: () => {
							// Guard out of bounds range:
							const selection = document.getSelection()
							if (!selection.rangeCount) {
								// No-op
								return
							}
							const range = selection.getRangeAt(0)
							if (range.startContainer === ref.current || range.endContainer === ref.current) {
								// Iterate to the deepest start node:
								let startNode = ref.current.childNodes[0]
								while (startNode.childNodes.length) {
									startNode = startNode.childNodes[0]
								}
								// Iterate to the deepest end node:
								let endNode = ref.current.childNodes[ref.current.childNodes.length - 1]
								while (endNode.childNodes.length) {
									endNode = endNode.childNodes[endNode.childNodes.length - 1]
								}
								// Correct range:
								range.setStart(startNode, 0)
								range.setEnd(endNode, (endNode.nodeValue || "").length)
								selection.removeAllRanges()
								selection.addRange(range)
							}
							const [pos1, pos2] = computePosRange(ref.current)
							const extPosRange = extendPosRange(state, [pos1, pos2])
							setState(current => ({
								...current,
								pos1,
								pos2,
								extPosRange,
							}))
						},

						onPointerDown: () => {
							pointerDownRef.current = true
						},
						onPointerMove: () => {
							// Editor must be focused and pointer must be down:
							if (!state.focused || !pointerDownRef.current) {
								pointerDownRef.current = false // Reset to be safe
								return
							}
							const [pos1, pos2] = computePosRange(ref.current)
							const extPosRange = extendPosRange(state.data, [pos1.root, pos2.root])
							setState(current => ({
								...current,
								pos1,
								pos2,
								extPosRange,
							}))
						},
						onPointerUp: () => {
							pointerDownRef.current = false
						},

						onKeyDown: e => {
							if (e.keyCode === keyCodes.Enter /* && e.shiftKey */) {
								e.preventDefault()
								actions.enter(state, setState)
								return
							}
						},

						// TODO: onCompositionEnd
						onInput: () => {
							// Force a re-render when empty (Update
							// state.data reference):
							if (!ref.current.childNodes.length) {
								// No-op
								setState(current => ({
									...current,
									data: [...state.data],
								}))
								return
							}
							const { roots: [root1, root2], root2AtEnd } = queryRoots(ref.current, state.extPosRange)
							const x1 = state.data.findIndex(each => each.id === root1.id)
							if (x1 === -1) {
								throw new Error("onInput: x1 out of bounds")
							}
							const x2 = !root2AtEnd ? state.data.findIndex(each => each.id === root2.id) : state.data.length - 1
							if (x2 === -1) {
								throw new Error("onInput: x2 out of bounds")
							}
							const unparsed = readRoots(ref.current, [root1, root2])
							const [pos1, pos2] = computePosRange(ref.current)
							setState(current => ({ // FIXME: Use current
								...current,
								data: [...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)],
								pos1,
								pos2,
								// NOTE: Do not extendPosRange here; defer
								// to end of useLayoutEffect
							}))
						},

						contentEditable: !state.readOnly,
						suppressContentEditableWarning: !state.readOnly,
					},
				)}

				{DEBUG_MODE && (
					<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
						{JSON.stringify(
							{
								// extPosRange: state.extPosRange,
								// id: state.data.map(each => each.id),

								...state,
								reactDOM: undefined, // Obscure
							},
							null,
							"\t",
						)}
					</div>
				)}

			</div>
		</Provider>
	)
}

export default Editor
