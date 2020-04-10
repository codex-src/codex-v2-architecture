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

// // Ascends to the nearest keyed-paragraph.
// function ascendToID(editorRoot, node) {
// 	// TODO: Scope to editorRoot
// 	while (true) {
// 		if (node.nodeType === Node.ELEMENT_NODE && node.id) {
// 			// No-op
// 			break
// 		}
// 		node = node.parentNode
// 	}
// 	return node
// }

// Extends the cursor IDs (up to two before and after).
function extendPosIDs(data, [pos1, pos2]) {
	let index1 = data.findIndex(each => each.id === pos1.id)
	// let index2 = data.findIndex(each => each.id === pos2.id)
	let index2 = index1
	if (pos2.id !== pos1.id) {
		index2 = data.findIndex(each => each.id === pos2.id)
	}
	// Guard bounds:
	index1 -= 2
	if (index1 < 0) {
		index1 = 0
	}
	index2 += 2
	if (index2 >= data.length) {
		index2 = data.length - 1
	}
	return [data[index1].id, data[index2].id]
}

// Computes the DOM element root ID and offset from a range
// data structure.
function computeUUIDAndOffsetFromRange(editorRoot, range) {
	// if (!range.node && !range.offset) {
	// 	return { id: "", offset: "" }
	// }

	let { node } = range
	while (node.nodeType !== Node.ELEMENT_NODE || !node.id) {
		node = node.parentNode
	}
	const elementRoot = node
	const { id } = elementRoot
	// Recursively counts the offset from an element to a
	// range node and offset.
	let offset = 0
	const recurse = element => {
		for (const each of element.childNodes) {
			if (each === range.node) {
				offset += range.offset
				// Stop recursion:
				return true
			}
			offset += (each.nodeValue || "").length
			if (recurse(each)) {
				// Stop recursion:
				return true
			}
			// NOTE: Use next.getAttribute instead of next.id
			// because next.id always returns ""
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
				offset++
			}
		}
		return false
	}
	recurse(elementRoot)
	return { id, offset }
}

// Computes a range data structure from a cursor data
// structure.
//
// NOTE: Don’t mutate pos -- copy
function computeRangeFromPos(editorRoot, { ...pos }) {
	const elementRoot = document.getElementById(pos.id)
	if (!elementRoot) {
		throw new Error("computeRangeFromPos: no such uuid element")
	}

	let node = null
	let offset = 0
	const recurse = element => {
		for (const each of element.childNodes) {
			const { length } = each.nodeValue || ""
			if (pos.offset - length <= 0) {
				node = each
				offset = pos.offset
				// Stop recursion:
				return true
			}
			pos.offset -= length
			if (recurse(each)) {
				// Stop recursion:
				return true
			}
			// NOTE: Use next.getAttribute instead of next.id
			// because next.id always returns ""
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
				pos.offset--
			}
		}
		return false
	}
	recurse(elementRoot)
	return { node, offset }
}

// Compares two cursor data structures.
function posAreSame(pos1, pos2) {
	const ok = (
		pos1.id === pos2.id &&
		pos1.offset === pos2.offset
	)
	return ok
}

// Returns whether cursor data structures are empty.
function posAreEmpty(pos1, pos2) {
	return [pos1, pos2].every(each => !each.id && !each.offset)
}

// Synchronizes the DOM cursor to cursor data structures.
//
// TODO: Guard !selection.rangeCount?
function syncPos(editorRoot, pos1, pos2) {
	if (posAreEmpty(pos1, pos2)) {
		// No-op
		return
	}
	// Get the cursor data structures from the DOM cursors:
	const selection = document.getSelection()
	if (selection.rangeCount) {
		const range = selection.getRangeAt(0)
		const domPos1 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.startContainer, offset: range.startOffset })
		let domPos2 = { ...domPos1 }
		if (!range.collapsed) {
			domPos2 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.endContainer, offset: range.endOffset })
		}
		// Compare the VDOM cursor data structures to the DOM data
		// structures:
		if (posAreSame(pos1, domPos1) && posAreSame(pos2, domPos2)) {
			// No-op
			return
		}
	}
	// Synchronize the DOM cursor to the VDOM cursor data
	// structures:
	const range = document.createRange()
	const r1 = computeRangeFromPos(editorRoot, pos1)
	range.setStart(r1.node, r1.offset)
	range.collapse()
	let r2 = { ...r1 }
	if (!posAreSame(pos1, pos2)) {
		r2 = computeRangeFromPos(editorRoot, pos2)
		range.setEnd(r2.node, r2.offset)
	}
	// // NOTE: syncTrees eagerly calls removeAllRanges
	// if (selection.rangeCount) {
	// 	selection.removeAllRanges()
	// }
	selection.addRange(range)
}

// Reads a DOM node.
function readNode(node) {
	return node.nodeValue || ""
}

// Recursively reads a DOM element.
//
// FIXME: DOM element root -> readElementRoot?
function readElement(element) {
	const recurse = readElement

	let str = ""
	for (const each of element.childNodes) {
		if (each.nodeType === Node.TEXT_NODE) {
			str += readNode(each)
			continue
		}
		str += recurse(each)
		const next = each.nextElementSibling
		if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
			str += "\n"
		}
	}
	return str
}

// Reads an unparsed (raw) data structure from extended IDs.
//
// TODO: Remove editorRoot from parameters
function readRawFromExtendedIDs(editorRoot, [startID, endID]) {
	let startElement = document.getElementById(startID)
	let endElement = startElement
	if (endID !== startID) {
		endElement = document.getElementById(endID)
	}
	// Re-extend the start element once:
	//
	// TODO: Conditionally re-extend? It’s confusing to always
	// re-extend
	if (startElement.previousElementSibling) {
		startElement = startElement.previousElementSibling
	}
	const seenIDs = {}
	const unparsed = []
	while (startElement) {
		let { id } = startElement
		if (!id || seenIDs[id]) {
			id = uuidv4()
			startElement.id = id
		}
		seenIDs[id] = true
		const raw = readElement(startElement)
		// const range = str.split("\n").map((each, index) => ({
		// 	id: !index ? id : uuidv4(),
		// 	raw: each,
		// }))
		unparsed.push({ id, raw })
		if (startElement === endElement) {
			// No-op
			break
		}
		startElement = startElement.nextElementSibling
	}
	// TODO: atStart, atEnd?
	return unparsed
}

// Computes a cursor data structure from a DOM node and a
// start or end range data structure.
function computePosFromRange(editorRoot, { node, offset }) {
	const pos = newPos()

	// TODO (1): Add guards for when node is outside of a
	// data-paragraph element or editorRoot
	// TODO (2): Scope to editorRoot

	// Iterate to the deepest node:
	while (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length) {
		node = node.childNodes[offset]
		offset = 0
	}
	// Iterate up to to the closest data-paragraph element:
	//
	// TODO: Reuse ascendToID
	let startNode = node
	while (true) {
		if (startNode.nodeType === Node.ELEMENT_NODE && startNode.id) {
			pos.id = startNode.id
			break
		}
		if (!startNode.parentNode) {
			throw new Error("computePosFromRange: startNode out of bounds")
		}
		startNode = startNode.parentNode
	}
	pos.id = startNode.id
	// Recurse to the range data structure node:
	const recurse = startNode => {
		for (const each of startNode.childNodes) {
			if (each === node) {
				pos.offset += offset
				// Stop recursion:
				return true
			}
			pos.offset += (each.nodeValue || "").length
			if (recurse(each)) {
				// Stop recursion:
				return true
			}
		}
		// Continue recursion:
		return false
	}
	recurse(startNode)
	return pos
}

// Computes the cursor from a reference to a DOM node.
function computePos(editorRoot) {
	const range = document.getSelection().getRangeAt(0)
	const rangeStart = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePosFromRange(editorRoot, rangeStart)
	let pos2 = { ...pos1 }
	if (!range.collapsed) { // TODO: state.hasSelection?
		const rangeEnd = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePosFromRange(editorRoot, rangeEnd)
	}
	return [pos1, pos2]
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

	// Tracks whether the pointer is down.
	const pointerDown = React.useRef()

	// Tracks the extended target IDs (up to two IDs before
	// and after the current selection).
	const extendedIDs = React.useRef(["", ""])

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
				// Sync the DOM cursor to the VDOM cursor data
				// structures:
				// if (posAreEmpty(state.pos1, state.pos2)) {
				// 	// No-op
				// 	return
				// }
				syncPos(ref.current, state.pos1, state.pos2)
				console.log("synced the DOM cursor")

				// // Synchronize the DOM cursor to the VDOM cursor (resets
				// // the range):
				// const r1 = computeRangeFromPos(editorRoot, pos1)
				// let r2 = { ...r1 }
				// if (pos1.id !== pos2.id) {
				// 	r2 = computeRangeFromPos(editorRoot, pos2)
				// }
				// range.setStart(r1.node, r1.offset)
				// range.setEnd(r2.node, r2.offset)
				// if (selection.rangeCount) {
				// 	selection.removeAllRanges()
				// }
				// selection.addRange(range)

				// TODO: Sync the cursor e.g. syncCursors(...)

				// if ((!state.components || !mutations) && state.actionType !== "PASTE") {
				// 	// No-op
				// 	return
				// }
				// // Reset the cursor:
				// const selection = document.getSelection()
				// if (selection.rangeCount) {
				// 	selection.removeAllRanges()
				// }
				// const range = document.createRange()
				// const { node, offset } = getRangeFromPos(ref.current, state.pos1.pos)
				// range.setStart(node, offset)
				// range.collapse()
				// if (state.pos1.pos !== state.pos2.pos) {
				// 	// TODO: Can optimize pos2 by reusing pos1
				// 	const { node, offset } = getRangeFromPos(ref.current, state.pos2.pos)
				// 	range.setEnd(node, offset)
				// }
				// selection.addRange(range)
			})
		}, [state, setState]),
		[state.data],
	)

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
							const selection = document.getSelection()
							if (!selection.rangeCount) {
								// No-op
								return
							}
							// Correct the range when the editor DOM
							// element is focused:
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
								// Correct the range:
								range.setStart(startNode, 0)
								range.setEnd(endNode, (endNode.nodeValue || "").length)
								selection.removeAllRanges()
								selection.addRange(range)
							}
							const [pos1, pos2] = computePos(ref.current)
							setState(current => ({
								...current,
								pos1,
								pos2,
							}))
							// TODO: Rename to extendPos? Use state
							// instead of state.data? Should extendedPos
							// be a member of state?
							extendedIDs.current = extendPosIDs(state.data, [pos1, pos2])
						},

						onPointerDown: () => {
							pointerDown.current = true
						},
						onPointerMove: () => {
							// Editor must be focused and pointer must be down:
							if (!state.focused || !pointerDown.current) {
								pointerDown.current = false // Reset to be safe
								return
							}
							const [pos1, pos2] = computePos(ref.current)
							setState(current => ({
								...current,
								pos1,
								pos2,
							}))
							// TODO: Rename to extendPos? Use state
							// instead of state.data? Should extendedPos
							// be a member of state?
							extendedIDs.current = extendPosIDs(state.data, [pos1, pos2])
						},
						onPointerUp: () => {
							pointerDown.current = false
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

							// Tab (e.ctrlKey must be false because of
							// common shortcuts):
							if (!e.ctrlKey && e.keyCode === KeyCodes.Tab) {
								e.preventDefault()
								let action = null
								switch (true) {
								// TODO: state.pos.id breaks down for
								// multiline components
								case !e.shiftKey && state.pos1.id === state.pos2.id:
									action = actions.tab
									break
								// TODO: state.pos.id breaks down for
								// multiline components
								case !e.shiftKey && state.pos1.id !== state.pos2.id:
									action = actions.tabMany
									break
								case e.shiftKey:
									action = actions.detabMany
									break
								default:
									// No-op
								}
								action(state, setState)
								return
							}
							// Enter:
							if (e.keyCode === KeyCodes.Enter) {
								e.preventDefault()
								actions.enter(state, setState)
								return
							}
						},

						// TODO: onCompositionEnd

						onInput: () => {
							// TODO: Extract to action.input(state, setState)
							const unparsed = readRawFromExtendedIDs(ref.current, extendedIDs.current)
							const parsed = parse(unparsed)
							const index1 = state.data.findIndex(each => each.id === unparsed[0].id)
							if (index1 === -1) {
								throw new Error("onInput: index1 is out of bounds")
							}
							const index2 = state.data.findIndex(each => each.id === unparsed.slice(-1)[0].id)
							if (index2 === -1) {
								throw new Error("onInput: index2 is out of bounds")
							}
							const data = [...state.data]
							data.splice(index1, (index2 + 1) - index1, ...parsed)
							setState(current => ({
								...current,
								data,
							}))
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
