import actions from "./actions"
import EditorContext from "./EditorContext"
import KeyCodes from "./KeyCodes"
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

// Gets the extended cursor root IDs.
function getExtendedPosRootIDs(data, [pos1, pos2]) {
	let index1 = data.findIndex(each => each.id === pos1.root.id)
	index1 -= 2
	// Guard bounds:
	if (index1 < 0) {
		index1 = 0
	}
	let index2 = data.findIndex(each => each.id === pos2.root.id)
	index2 += 2
	// Guard bounds:
	if (index2 >= data.length) {
		index2 = data.length - 1
	}
	return [data[index1].id, data[index2].id]
}

// // Reads a DOM node.
// function readNode(node) {
// 	return node.nodeValue || ""
// }
//
// // Recursively reads a DOM element.
// //
// // FIXME: DOM element root -> readElementRoot?
// function readElement(element) {
// 	const recurse = readElement
//
// 	let str = ""
// 	for (const each of element.childNodes) {
// 		if (each.nodeType === Node.TEXT_NODE) {
// 			str += readNode(each)
// 			continue
// 		}
// 		str += recurse(each)
// 		const next = each.nextElementSibling
// 		if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
// 			str += "\n"
// 		}
// 	}
// 	return str
// }

// // Reads an unparsed (raw) data structure from extended IDs.
// //
// // TODO: Remove editorRoot from parameters
// function readRawFromExtendedIDs(editorRoot, [startID, endID]) {
// 	let startElement = document.getElementById(startID)
// 	let endElement = startElement
// 	if (endID !== startID) {
// 		endElement = document.getElementById(endID)
// 	}
// 	// Re-extend the start element once:
// 	//
// 	// TODO: Conditionally re-extend? It’s confusing to always
// 	// re-extend
// 	if (startElement.previousElementSibling) {
// 		startElement = startElement.previousElementSibling
// 	}
// 	const seenIDs = {}
// 	const unparsed = []
// 	while (startElement) {
// 		let { id } = startElement
// 		if (!id || seenIDs[id]) {
// 			id = uuidv4()
// 			startElement.id = id
// 		}
// 		seenIDs[id] = true
// 		const raw = readElement(startElement)
// 		// const range = str.split("\n").map((each, index) => ({
// 		// 	id: !index ? id : uuidv4(),
// 		// 	raw: each,
// 		// }))
// 		unparsed.push({ id, raw })
// 		if (startElement === endElement) {
// 			// No-op
// 			break
// 		}
// 		startElement = startElement.nextElementSibling
// 	}
// 	// TODO: atStart, atEnd?
// 	return unparsed
// }

// - hello
// 	- hello
// 			- hello
// 	- hello
// - hello

/*

<div data-root>
	<div data-node>
		hello, world!
	</div>
	<div data-node>
		<div>
			<div>
				hello, world!
			</div>
		</div>
	</div>
	<div data-node>
		hello, world!
	</div>
</div>

*/

// Reads a data-root element. Returns an array of unparsed
// data structures.
function readRoot(root) {
	const unparsed = [
		{
			id: root.id,
			raw: "",
		},
	]
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

// Reads a range of data-root element IDs. Returns an array
// of unparsed data structures.
function readRootIDs(editorRoot, [extendedID1, extendedID2]) {
	// Get root1:
	let root1 = document.getElementById(extendedID1)
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error(`readRootIDs: no such root1 (id=${root1.id || ""}) or out of bounds`)
	}
	// Extend root1 when was at the start:
	const prev = root1.previousElementSibling
	if (prev && !prev.previousElementSibling) {
		root1 = prev
	}
	// Get root2:
	const root2 = document.getElementById(extendedID2)
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error(`readRootIDs: no such root2 (id=${root2.id || ""}) or out of bounds`)
	}
	// Read unparsed:
	const unparsed = []
	let root = root1
	while (root) {
		const seen = !root.id || unparsed.some(each => each.id === root.id)
		if (seen) {
			root.id = uuidv4()
		}
		unparsed.push(...readRoot(root))
		if (root == root2) {
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
	const editorRootRef = React.useRef()

	const pointerDownRef = React.useRef()
	const extendedIDsRef = React.useRef(["", ""])

	// Renders to the DOM.
	React.useLayoutEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document data={state.data} />, state.reactDOM, () => {
				// Sync the React-managed DOM tree to the user-
				// managed DOM tree:
				const mutations = syncTrees(state.reactDOM, editorRootRef.current)
				if (!mutations) {
					// No-op
					return
				}
				// // Sync the DOM cursor to the VDOM cursor data
				// // structures:
				// // if (posAreEmpty(state.pos1, state.pos2)) {
				// // 	// No-op
				// // 	return
				// // }
				// syncPos(editorRootRef.current, state.pos1, state.pos2)
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
						ref: editorRootRef,

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
							const range = selection.getRangeAt(0)
							if (range.startContainer === editorRootRef.current || range.endContainer === editorRootRef.current) {
								// Iterate to the deepest start node:
								let startNode = editorRootRef.current.childNodes[0]
								while (startNode.childNodes.length) {
									startNode = startNode.childNodes[0]
								}
								// Iterate to the deepest end node:
								let endNode = editorRootRef.current.childNodes[editorRootRef.current.childNodes.length - 1]
								while (endNode.childNodes.length) {
									endNode = endNode.childNodes[endNode.childNodes.length - 1]
								}
								// Correct range:
								range.setStart(startNode, 0)
								range.setEnd(endNode, (endNode.nodeValue || "").length)
								selection.removeAllRanges()
								selection.addRange(range)
							}
							const [pos1, pos2] = computePos(editorRootRef.current)
							setState(current => ({
								...current,
								pos1,
								pos2,
							}))
							extendedIDsRef.current = getExtendedPosRootIDs(state.data, [pos1, pos2])
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
							const [pos1, pos2] = computePos(editorRootRef.current)
							setState(current => ({
								...current,
								pos1,
								pos2,
							}))
							extendedIDsRef.current = getExtendedPosRootIDs(state.data, [pos1, pos2])
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
							const unparsed = readRootIDs(editorRootRef.current, extendedIDsRef.current)
							console.log(unparsed)

							// // TODO: Extract to action.input(state, setState)
							// const unparsed = readRawFromExtendedIDs(editorRootRef.current, extendedIDs.current)
							// const parsed = parse(unparsed)
							// const index1 = state.data.findIndex(each => each.id === unparsed[0].id)
							// if (index1 === -1) {
							// 	throw new Error("onInput: index1 is out of bounds")
							// }
							// const index2 = state.data.findIndex(each => each.id === unparsed.slice(-1)[0].id)
							// if (index2 === -1) {
							// 	throw new Error("onInput: index2 is out of bounds")
							// }
							// const data = [...state.data]
							// data.splice(index1, (index2 + 1) - index1, ...parsed)
							// setState(current => ({
							// 	...current,
							// 	data,
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
