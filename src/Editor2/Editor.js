import EditorContext from "./EditorContext"
import KeyCode from "./KeyCode"
import newPos from "./newPos"
import parse from "./parser"
import React from "react"
import ReactDOM from "react-dom"
import syncTrees from "./syncTrees"
import typeMap from "./typeMap"
import uuidv4 from "uuid/v4"

const DEBUG_MODE = true && process.env.NODE_ENV !== "production"

// Ascends to the nearest keyed-paragraph.
function ascendToID(rootElement, node) {
	// TODO: Scope to rootElement
	while (true) {
		if (node.nodeType === Node.ELEMENT_NODE && node.id) {
			// No-op
			break
		}
		node = node.parentNode
	}
	return node
}

// Extends the cursor IDs (up to two before and after).
function extendPosIDs([pos1, pos2], data) {
	let x1 = data.findIndex(each => each.id === pos1.id)
	// let x2 = x1
	// if (pos2.id !== pos1.id) {
	// 	x2 = data.findIndex(each => each.id === pos2.id)
	// }
	let x2 = data.findIndex(each => each.id === pos2.id)
	// Guard bounds:
	x1 -= 2
	if (x1 < 0) {
		x1 = 0
	}
	x2 += 2
	if (x2 >= data.length) {
		x2 = data.length - 1
	}
	return [data[x1].id, data[x2].id]
}

// // Gets (reads) parsed nodes from node iterators.
// //
// // TODO: Extract to helpers?
// function getNodesFromIterators(rootNode, [start, end]) {
// 	// Re-extend the target start (up to 1x):
// 	if (!start.count && start.getPrev()) {
// 		start.prev()
// 	}
// 	// NOTE: Do not re-extend the target end
// 	const atEnd = !end.count
// 	// Get nodes:
// 	const seenKeys = {}
// 	const nodes = []
// 	while (start.currentNode) {
// 		// Read the key:
// 		let key = start.currentNode.getAttribute("data-node")
// 		if (seenKeys[key]) {
// 			key = uuidv4()
// 			start.currentNode.setAttribute("data-node", key)
// 		}
// 		// Read the data:
// 		seenKeys[key] = true
// 		const data = innerText(start.currentNode)
// 		nodes.push({ key, data })
// 		if (start.currentNode === end.currentNode) {
// 			// No-op
// 			break
// 		}
// 		start.next()
// 	}
// 	return { nodes, atEnd }
// }

// Reads a DOM node.
function readNode(node) {
	return node.nodeValue || ""
}

// Recursively reads a DOM element.
function readElement(element) {
	const recurse = readElement

	let str = ""
	for (const each of element.childNodes) {
		if (each.nodeType === Node.TEXT_NODE) {
			str += readNode(each)
			continue
		}
		str += recurse(each)
		const nextElement = each.nextElementSibling
		if (nextElement && nextElement.getAttribute("data-paragraph")) {
			str += "\n"
		}
	}
	return str
}

// Reads an unparsed (raw) data structure from extended IDs.
//
// TODO: Remove rootElement from parameters
function readRawFromExtendedIDs(rootElement, [startID, endID]) {
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
		// const range = str.split("\n").map((each, x) => ({
		// 	id: !x ? id : uuidv4(),
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
function computePosFromRange(rootElement, { node, offset }) {
	const pos = newPos()

	// TODO (1): Add guards for when node is outside of a
	// data-paragraph element or rootElement
	// TODO (2): Scope to rootElement

	// Iterate to the innermost node:
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
function computePos(rootElement) {
	const range = document.getSelection().getRangeAt(0)
	const rangeStart = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePosFromRange(rootElement, rangeStart)
	let pos2 = { ...pos1 }
	if (!range.collapsed) { // TODO: state.hasSelection?
		const rangeEnd = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePosFromRange(rootElement, rangeEnd)
	}
	const selected = pos1.id !== pos2.id || pos1.offset !== pos2.offset
	return { selected, pos1, pos2 }
}

const Document = ({ data }) => (
	data.map(({ type: T, ...props }) => (
		React.createElement(typeMap[T], {
			key: props.id,
			...props,
		})
	))
)

const Editor = ({ id, tag, state, setState }) => {
	const ref = React.useRef()

	// Tracks whether the pointer is down.
	const pointerDown = React.useRef()

	// Tracks the extended target IDs (up to two IDs before
	// and after the current selection).
	const extendedIDs = React.useRef(["", ""])

	// Renders to the DOM.
	React.useEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document data={state.data} />, state.reactDOM, () => {
				// Sync the React-managed DOM tree to the user-
				// managed DOM tree:
				const mutations = syncTrees(state.reactDOM, ref.current)
				if (!mutations) {
					// No-op
					return
				}
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

				const selection = document.getSelection()
				selection.removeAllRanges()
			})
		}, [state, setState]),
		[state.data],
	)

	const { Provider } = EditorContext
	return (
		<Provider value={[state, setState]}>

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
						// Correct the selection when the editor is
						// selected instead of the innermost start and
						// end nodes (expected behavior):
						const range = selection.getRangeAt(0)
						if (range.startContainer === ref.current || range.endContainer === ref.current) {
							// Iterate to the innermost start node:
							let startNode = ref.current.childNodes[0]
							while (startNode.childNodes.length) {
								startNode = startNode.childNodes[0]
							}
							// Iterate to the innermost end node:
							let endNode = ref.current.childNodes[ref.current.childNodes.length - 1]
							while (endNode.childNodes.length) {
								endNode = endNode.childNodes[endNode.childNodes.length - 1]
							}
							// Correct the selection:
							const range = document.createRange()
							range.setStart(startNode, 0)
							range.setEnd(endNode, (endNode.nodeValue || "").length)
							selection.removeAllRanges()
							selection.addRange(range)
						}
						const { selected, pos1, pos2 } = computePos(ref.current)
						setState(current => ({ ...current, selected, pos1, pos2 }))
						extendedIDs.current = extendPosIDs([pos1, pos2], state.data)
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
						const { selected, pos1, pos2 } = computePos(ref.current)
						setState(current => ({ ...current, selected, pos1, pos2 }))
						extendedIDs.current = extendPosIDs([pos1, pos2], state.data)
					},
					onPointerUp: () => {
						pointerDown.current = false
					},

					onKeyDown: e => {
						// // Tab:
						// if (!e.ctrlKey && e.keyCode === KEY_CODE_TAB) {
						// 	e.preventDefault()
						// 	dispatch.tab()
						// 	return
						// // Enter:
						// } else if (e.keyCode === KEY_CODE_ENTER) {
						// 	e.preventDefault()
						// 	dispatch.enter()
						// 	return
						// // Undo:
						// } else if (detect.undo(e)) {
						// 	e.preventDefault()
						// 	dispatch.undo()
						// 	return
						// // Redo:
						// } else if (detect.redo(e)) {
						// 	e.preventDefault()
						// 	dispatch.redo()
						// 	return
						// }

						// Guard e.ctrlKey (browser shortcut):
						if (!e.ctrlKey && e.keyCode === KeyCode.Tab) {
							e.preventDefault()
							let fn = tab
							// Prefer detab if the cursor is selecting
							// multiple lines:
							if (e.shiftKey && state.pos1.id !== state.pos2.id) {
								fn = detab
							}
							fn(state, setState)
						}
					},

					onInput: () => {
						const unparsed = readRawFromExtendedIDs(ref.current, extendedIDs.current)
						const parsed = parse(unparsed)

						const x1 = state.data.findIndex(each => each.id === unparsed[0].id)
						if (x1 === -1) {
							throw new Error("onInput: x1 is out of bounds")
						}
						const x2 = state.data.findIndex(each => each.id === unparsed.slice(-1)[0].id)
						if (x2 === -1) {
							throw new Error("onInput: x2 is out of bounds")
						}

						// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
						const data = [...state.data]
						data.splice(x1, (x2 + 1) - x1, ...parsed)

						setState(current => ({
							...current,
							focused: false,  // DEBUG
							selected: false, // DEBUG
							data,
							// TODO: pos1 and pos2
						}))

						// state.body.splice(x1, (x2 + 1) - x1, ...nodes)

						// console.log(x1, x2)

						// const key1 = nodes[0].key
						// const x1 = state.body.findIndex(each => each.key === key1)
						// if (x1 === -1) {
						// 	throw new Error("FIXME")
						// }
						// const key2 = nodes[nodes.length - 1].key
						// const x2 = !atEnd ? state.body.findIndex(each => each.key === key2) : state.body.length - 1
						// if (x2 === -1) {
						// 	throw new Error("FIXME")
						// }
						// state.body.splice(x1, (x2 + 1) - x1, ...nodes)
						// // Update data, pos1, and pos2:
						// const data = state.body.map(each => each.data).join("\n")
						// Object.assign(state, { data, pos1, pos2 })
						// this.render()

						// const { nodes, atEnd } = getNodesFromIterators(ref.current, target.current)
						// const [pos1, pos2] = getPos(ref.current)
						// dispatch.actionInput(nodes, atEnd, pos1, pos2)
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

		</Provider>
	)
}

// selectEnum.None
// selectEnum.Line
// selectEnum.Multiline
//
// selected: "none"
// selected: "line"
// selected: "multiline"

// Removes a leading tab over multiple lines.
function detab(state, setState) {
	const x1 = state.data.findIndex(each => each.id === state.pos1.id)
	let x2 = x1
	if (state.pos2.id !== state.pos2.id) {
		// TODO: Optimize using x1 e.g. findIndexAfter?
		x2 = state.data.findIndex(each => each.id === state.pos2.id)
	}
	const unparsed = state.data.slice(x1, x2 + 1).map(each => ({
		...each,
		raw: each.raw.replace(/^\t/, ""),
	}))
	const dec1 = unparsed[0].raw.length !== state.data[x1].raw.length
	const dec2 = unparsed.slice(-1)[0].raw.length !== state.data[x2].raw.length
	setState(current => ({
		...current,
		data: [...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)],
		pos1: {
			...state.pos1,
			offset: state.pos1.offset - dec1,
		},
		pos2: {
			...state.pos2,
			offset: state.pos2.offset - dec2,
		},
	}))
}

// If the cursor has no selection or is selecting one line,
// tab inserts a tab character. Otherwise, tab inserts a
// leading tab over multiple lines.
function tab(state, setState) {
	const x1 = state.data.findIndex(each => each.id === state.pos1.id)
	let x2 = x1
	if (state.pos2.id !== state.pos2.id) {
		// TODO: Optimize using x1 e.g. findIndexAfter?
		x2 = state.data.findIndex(each => each.id === state.pos2.id)
	}
	const unparsed = state.data.slice(x1, x2 + 1).map(each => ({
		...each,
		raw: state.pos1.id === state.pos2.id
			? `${each.raw.slice(0, state.pos1.offset)}\t${each.raw.slice(state.pos2.offset)}`
			: `\t${each.raw}`,
	}))
	setState(current => ({
		...current,
		data: [...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)],
		pos1: {
			...state.pos1,
			offset: state.pos1.offset + 1,
		},
		pos2: {
			...state.pos1,
			offset: !state.selected
				? state.pos1.offset + 1
				: state.pos2.offset + 1,
		},
	}))
}

export default Editor
