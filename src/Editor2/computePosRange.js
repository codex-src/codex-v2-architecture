import { newPos } from "./constructors"

// Counts the offset from an element to a node.
function countOffset(element, node) {
	let offset = 0
	const recurse = any => {
		if (any === node) {
			return true
		}
		for (const each of any.childNodes) {
			if (recurse(each)) {
				return true
			}
			offset += (node.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				offset++
			}
		}
		return false
	}
	recurse(element)
	return offset
}

// Computes a cursor data structure from a range data
// structure.
function computePos(editorRoot, { ...range }) {
	if (!range.node || !editorRoot.contains(range.node)) {
		throw new Error("computePos: no such node or out of bounds")
	}
	const pos = newPos()
	// Iterate range.node to the deepest node:
	while (range.node.nodeType === Node.ELEMENT_NODE && range.node.childNodes.length) {
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
	// Compute pos.root.id; ascend to the nearest data-root
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

// Computes cursor data structures.
function computePosRange(editorRoot) {
	const range = document.getSelection().getRangeAt(0)
	const rangeStart = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePos(editorRoot, rangeStart)
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		const rangeEnd = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePos(editorRoot, rangeEnd)
	}
	return [pos1, pos2]
}

export default computePosRange
