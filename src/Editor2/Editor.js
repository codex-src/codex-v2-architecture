import actions from "./actions"
import computePosRange from "./computePosRange"
import EditorContext from "./EditorContext"
import keyCodes from "./keyCodes"
import parse from "./parser"
import React from "react"
import ReactDOM from "react-dom"
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

// Reads a data-root element.
function readRoot(root) {
	const unparsed = [
		{
			id: root.id,
			raw: "",
		},
	]
	const recurse = any => {
		if (any.nodeType === Node.TEXT_NODE) {
			unparsed[unparsed.length - 1].raw += any.nodeValue
			return
		}
		for (const each of any.childNodes) {
			recurse(each)
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				unparsed.push({
					id: next.id,
					raw: "",
				})
			}
		}
	}
	recurse(root)
	return unparsed
}

// Reads a range of data-root elements.
function readRoots(editorRoot, [startRoot, endRoot]) {
	const unparsed = []
	const seen = {}
	while (startRoot) {
		// Guard repeat IDs:
		if (!startRoot.id || seen[startRoot.id]) {
			startRoot.id = uuidv4()
		}
		seen[startRoot.id] = true
		unparsed.push(...readRoot(startRoot))
		if (startRoot === endRoot) {
			// No-op
			break
		}
		startRoot = startRoot.nextElementSibling
	}
	return unparsed
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

	const isPointerDownRef = React.useRef()

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
							isPointerDownRef.current = true
						},
						onPointerMove: () => {
							// Editor must be focused and pointer must be down:
							if (!state.focused || !isPointerDownRef.current) {
								isPointerDownRef.current = false // Reset to be safe
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
							isPointerDownRef.current = false
						},

						onKeyDown: e => {
							if (e.keyCode === keyCodes.Enter /* && e.shiftKey */) {
								e.preventDefault()
								actions.enter(state, setState)
								return
							}

							// // Tab (e.ctrlKey must be false because of
							// // common shortcuts):
							// if (!e.ctrlKey && e.keyCode === keyCodes.Tab) {
							// 	e.preventDefault()
							// 	let action = null
							// 	switch (true) {
							// 	// TODO: state.pos.id breaks down for
							// 	// multiline components
							// 	case !e.shiftKey && state.pos1.id === state.pos2.id:
							// 		action = actions.tab
							// 		break
							// 	// TODO: state.pos.id breaks down for
							// 	// multiline components
							// 	case !e.shiftKey && state.pos1.id !== state.pos2.id:
							// 		action = actions.tabMany
							// 		break
							// 	case e.shiftKey:
							// 		action = actions.detabMany
							// 		break
							// 	default:
							// 		// No-op
							// 	}
							// 	action(state, setState)
							// 	return
							// }
							// // Enter:
							// if (e.keyCode === keyCodes.Enter) {
							// 	e.preventDefault()
							// 	actions.enter(state, setState)
							// 	return
							// }
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

							// Query the start root:
							const startRoot = document.getElementById(state.extPosRange[0])
							if (!startRoot || !ref.current.contains(startRoot)) {
								// console.error(`startID=${startID}`)
								throw new Error("readRoots: no such startRoot or out of bounds")
							}
							// Query the end root:
							let endRoot = document.getElementById(state.extPosRange[1])
							let endRootAtEnd = false
							// Guard enter pressed on endRoot:
							const nextRoot = endRoot && endRoot.nextElementSibling
							if (nextRoot && nextRoot.getAttribute("data-root") && (!nextRoot.id || nextRoot.id === endRoot.id)) {
								nextRoot.id = uuidv4() // Correct the ID
								endRoot = nextRoot
								endRootAtEnd = true
							// Guard backspaced pressed on endRoot:
							} else if (!endRoot) {
								endRoot = ref.current.children[ref.current.children.length - 1]
								endRootAtEnd = true
							}
							if (!endRoot || !ref.current.contains(endRoot)) {
								// console.error(`endID=${endID}`)
								throw new Error("readRoots: no such endRoot or out of bounds")
							}

							const startIndex = state.data.findIndex(each => each.id === startRoot.id)
							if (startIndex === -1) {
								throw new Error("onInput: startIndex out of bounds")
							}
							const endIndex = !endRootAtEnd ? state.data.findIndex(each => each.id === endRoot.id) : state.data.length - 1
							if (endIndex === -1) {
								throw new Error("onInput: endIndex out of bounds")
							}
							const unparsed = readRoots(ref.current, [startRoot, endRoot])
							const [pos1, pos2] = computePosRange(ref.current)
							setState(current => ({ // FIXME: Use current
								...current,
								data: [...state.data.slice(0, startIndex), ...parse(unparsed), ...state.data.slice(endIndex + 1)],
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
