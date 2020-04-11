// import actions from "./actions"
// import KeyCodes from "./KeyCodes"
import EditorContext from "./EditorContext"
import newPos from "./newPos"
import parse from "./parser"
import React from "react"
import ReactDOM from "react-dom"
import syncTrees from "./syncTrees"
import typeMap from "./typeMap"
import uuidv4 from "uuid/v4"

const DEBUG_MODE = true && process.env.NODE_ENV !== "production"

// Counts the offset from an element to a node.
function countOffset(element, node) {
	let offset = 0
	const recurse = element => {
		for (const each of element.childNodes) {
			if (each === node) {
				return true
			}
			offset += (node.nodeValue || "").length
			if (recurse(each)) {
				return true
			}
			const next = each.nextElementSibling
			offset += next && Boolean(next.getAttribute("data-node"))
		}
		return false
	}
	recurse(element)
	return offset
}

// Computes a cursor data structure from a range data
// structure.
function computePosFromRange(editorRoot, { ...range }) {
	if (!editorRoot.contains(range.node)) {
		throw new Error("computePosFromRange: node out of bounds")
	}
	const pos = newPos()
	// Iterate range.node to the deepest node:
	while (range.node.childNodes && range.node.childNodes.length) {
		range.node = range.node.childNodes[range.offset]
		range.offset = 0
	}
	// Compute pos.node.id; ascend to the nearest data-node or
	// data-root element:
	let node = range.node // eslint-disable-line prefer-destructuring
	while (!(node.getAttribute && (node.getAttribute("data-node") || node.getAttribute("data-root")))) {
		node = node.parentElement
	}
	pos.node.id = node.id
	// Compute pos.root.id:; ascend to the nearest data-root
	// element:
	let root = node
	while (!(root.getAttribute && root.getAttribute("data-root"))) {
		root = root.parentElement
	}
	pos.root.id = root.id
	// Compute the offset from node and root to range.node:
	pos.node.offset = countOffset(node, range.node) + range.offset
	pos.root.offset = countOffset(root, range.node) + range.offset
	// Done:
	return pos
}

// Computes the cursor data structures.
function computePos(editorRoot) {
	const range = document.getSelection().getRangeAt(0)
	const rangeStart = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePosFromRange(editorRoot, rangeStart)
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		const rangeEnd = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePosFromRange(editorRoot, rangeEnd)
	}
	return [pos1, pos2]
}

// Creates an extended cursor ID (root ID) range.
function extendPosRange(data, [pos1, pos2]) {
	let index1 = data.findIndex(each => each.id === pos1.root.id)
	index1 -= 2 // Decrement 2x
	// Guard bounds:
	if (index1 < 0) {
		index1 = 0
	}
	let index2 = data.findIndex(each => each.id === pos2.root.id)
	index2 += 2 // Increment 2x
	// Guard bounds:
	if (index2 >= data.length) {
		index2 = data.length - 1
	}
	return [data[index1].id, data[index2].id]
}

// Reads a data-root element. Returns an array of unparsed
// data structures.
function readRoot(root) {
	const unparsed = [{
		id: root.id,
		raw: "",
	}]
	const recurse = element => {
		for (const each of element.childNodes) {
			unparsed[unparsed.length - 1].raw += each.nodeValue || ""
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

// Reads a cursor ID (root ID) range.
function readPosRange(editorRoot, [pos1ID, pos2ID]) {
	// TODO: Extract to getRootsAndReextend(editorRoot, [pos1ID, pos2ID])
	// ... readRoots(editorRoot, root1, root2)

	// Get root1:
	let root1 = document.getElementById(pos1ID)
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error(`readPosRange: no such id=${pos1ID || ""} or out of bounds`)
	}
	const prev = root1.previousElementSibling
	if (prev && !prev.previousElementSibling) {
		root1 = prev
	}
	// Get root2:
	let root2 = document.getElementById(pos2ID)
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error(`readPosRange: no such id=${pos2ID || ""} or out of bounds`)
	}
	const next = root2.nextElementSibling
	if (next && !next.nextElementSibling) {
		// Guard repeat IDs:
		if (!next.id || next.id === root2.id) {
			next.id = uuidv4()
		}
		root2 = next
	}
	// Read unparsed:
	const unparsed = []
	let root = root1
	while (root) {
		// Guard repeat IDs:
		//
		// eslint-disable-next-line no-loop-func
		const seen = !root.id || unparsed.some(each => each.id === root.id)
		if (seen) {
			root.id = uuidv4()
		}
		unparsed.push(...readRoot(root))
		if (root === root2) {
			// No-op
			break
		}
		root = root.nextElementSibling
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

	const pointerDownRef = React.useRef()

	// Renders to the DOM.
	React.useLayoutEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document data={state.data} />, state.reactDOM, () => {
				// Sync the React-managed DOM tree to the user-
				// managed DOM tree:
				const mutations = syncTrees(state.reactDOM, ref.current)
				if (!mutations) {
					// No-op
					return
				}
				// NOTE: syncPos is needed when an event is
				// prevented and the editor is mutated, e.g. enter,
				// tab, etc.
				// // Sync the DOM cursor to the VDOM cursor data
				// // structures:
				// // if (posAreEmpty(state.pos1, state.pos2)) {
				// // 	// No-op
				// // 	return
				// // }
				// syncPos(ref.current, state.pos1, state.pos2)
				// console.log("synced the DOM cursor")
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
							// Correct range when out of bounds:
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
							const [pos1, pos2] = computePos(ref.current)
							const extendedPosRange = extendPosRange(state.data, [pos1, pos2])
							setState(current => ({
								...current,
								pos1,
								pos2,
								extendedPosRange,
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
							const [pos1, pos2] = computePos(ref.current)
							const extendedPosRange = extendPosRange(state.data, [pos1, pos2])
							setState(current => ({
								...current,
								pos1,
								pos2,
								extendedPosRange,
							}))
						},
						onPointerUp: () => {
							pointerDownRef.current = false
						},

						onKeyDown: e => {
							// // Undo:
							// if (detect.undo(e)) {
							// 	e.preventDefault()
							// 	dispatch.undo()
							// 	return
							// // Redo:
							// } else if (detect.redo(e)) {
							// 	e.preventDefault()
							// 	dispatch.redo()
							// 	return
							// }

							// // Tab (e.ctrlKey must be false because of
							// // common shortcuts):
							// if (!e.ctrlKey && e.keyCode === KeyCodes.Tab) {
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
							// if (e.keyCode === KeyCodes.Enter) {
							// 	e.preventDefault()
							// 	actions.enter(state, setState)
							// 	return
							// }
						},

						// TODO: onCompositionEnd
						onInput: () => {
							// const posRange = state.extendedPosRange
							// console.log(posRange)
							const posRange = state.extendedPosRange
							const index1 = state.data.findIndex(each => each.id === posRange[0])
							if (index1 === -1) {
								throw new Error("onInput: posRange[0] is out of bounds")
							}
							const index2 = state.data.findIndex(each => each.id === posRange[1])
							if (index2 === -1) {
								throw new Error("onInput: posRange[1] is out of bounds")
							}
							const unparsed = readPosRange(ref.current, posRange)
							console.log(unparsed)
							// setState(current => ({
							// 	...current,
							// 	data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
							// }))
						},

						contentEditable: !state.readOnly, // Inverse
						suppressContentEditableWarning: !state.readOnly, // Inverse
					},
				)}

				{DEBUG_MODE && (
					<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
						{JSON.stringify(
							{
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
