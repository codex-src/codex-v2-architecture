import { newPos } from "./constructors"

type Range = {
	node: Node,
	offset: number,
}

// // Counts the offset from an element to a node.
// function countOffset(element: HTMLElement, node: Node) {
// 	let offset = 0
// 	// console.log(element, node)
// 	const recurse = (on: Node) => {
// 		if (on === node) {
// 			return true
// 		}
// 		for (const each of on.childNodes) {
// 			if (recurse(each)) {
// 				return true
// 			}
// 			offset += (each.nodeValue || "").length
// 			const next = each.nextElementSibling
// 			if (next && next.getAttribute("data-node")) {
// 				offset++
// 			}
// 		}
// 		return false
// 	}
// 	recurse(element)
// 	return offset
// }

// Computes a cursor data structure from a range data
// structure.
function computePosFromRange(editorRoot: HTMLElement, { ...range }: Range) {
	if (!range.node || !editorRoot.contains(range.node)) {
		throw new Error("computePosFromRange: no such node or out of bounds")
	}
	// Iterate range.node to the deepest node:
	while (range.node.nodeType === Node.ELEMENT_NODE && range.node.childNodes.length) {
		range.node = range.node.childNodes[range.offset]
		range.offset = 0
	}
	const pos = newPos()


	// // Iterate range.node to the deepest node:
	// while (range.node.nodeType === Node.ELEMENT_NODE && range.node.childNodes.length) {
	// 	range.node = range.node.childNodes[range.offset]
	// 	range.offset = 0
	// }
	// // Compute pos.node.id; ascend to the nearest data-node or
	// // data-root element:
	// let node = range.node // eslint-disable-line prefer-destructuring
	// while (!(node.getAttribute && (node.getAttribute("data-node") || node.getAttribute("data-root")))) {
	// 	node = node.parentElement
	// }
	// pos.node.id = node.id
	// // Compute pos.root.id; ascend to the nearest data-root
	// // element:
	// let root = node
	// while (!(root.getAttribute && root.getAttribute("data-root"))) {
	// 	root = root.parentElement
	// }
	// pos.root.id = root.id

	// // Compute the offset from node and root to range.node:
	// pos.node.offset = countOffset(node, range.node) + range.offset
	// pos.root.offset = countOffset(root, range.node) + range.offset
	// // Done:
	// return pos

	return "lol"
}

// Computes cursor data structures.
function computePos(editorRoot: HTMLElement) {
	const selection = document.getSelection()
	if (!selection) {
		throw new Error("computePos: no such selection")
	}
	const range = selection.getRangeAt(0)
	const r1 = { node: range.startContainer, offset: range.startOffset }
	console.log(computePosFromRange(editorRoot, r1))

	// const range = document.getSelection().getRangeAt(0)
	// const rangeStart = { node: range.startContainer, offset: range.startOffset }
	// const pos1 = computePosFromRange(editorRoot, rangeStart)
	// let pos2 = { ...pos1 }
	// if (!range.collapsed) {
	// 	const rangeEnd = { node: range.endContainer, offset: range.endOffset }
	// 	pos2 = computePosFromRange(editorRoot, rangeEnd)
	// }
	// return [pos1, pos2]
}

export default computePos
