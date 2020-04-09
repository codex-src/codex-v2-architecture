import EditorContext from "./EditorContext"
import newPos from "./newPos"
import React from "react"
import ReactDOM from "react-dom"
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
	let index1 = data.findIndex(each => each.id === pos1.id)
	// let index2 = index1
	// if (pos2.id !== pos1.id) {
	// 	index2 = data.findIndex(each => each.id === pos2.id)
	// }
	let index2 = data.findIndex(each => each.id === pos2.id)
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
	return [pos1, pos2]
}

const Editor = ({ id, tag, state, setState }) => {
	const ref = React.useRef()

	// Tracks whether the pointer is down.
	const pointerDown = React.useRef()

	// Tracks the extended target IDs (up to two IDs before
	// and after the current selection).
	const extendedIDs = React.useRef(["", ""])

	// Renders to the DOM.
	//
	// NOTE: Do not use props.children or equivalent because
	// of contenteditable
	React.useEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			<Provider value={[state, setState]}>
				{state.data.map(({ type: T, ...props }) => (
					React.createElement(typeMap[T], {
						key: props.id,
						...props,
					})
				))}
			</Provider>,
			ref.current,
		)
	}, [state, setState])

	return (
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
						// Correct the selection when the editor is
						// selected instead of the innermost start and
						// end nodes (expected behavior):
						const selection = document.getSelection()
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
						const [pos1, pos2] = computePos(ref.current)
						setState(current => ({ ...current, pos1, pos2 }))
						extendedIDs.current = extendPosIDs([pos1, pos2], state.data)
						// console.log(extendedIDs.current)
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
						setState(current => ({ ...current, pos1, pos2 }))
						extendedIDs.current = extendPosIDs([pos1, pos2], state.data)
						// console.log(extendedIDs.current)
					},
					onPointerUp: () => {
						pointerDown.current = false
					},

					onInput: e => {
						const unparsed = readRawFromExtendedIDs(ref.current, extendedIDs.current)
						console.log(unparsed)

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
					{JSON.stringify(state, null, "\t")}
				</div>
			)}

		</div>
	)
}

export default Editor
