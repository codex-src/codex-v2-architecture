import { newPos } from "./constructors"

// Computes a cursor data structure.
function computePos(editorRoot, { ...range }) {
	const pos = newPos()
	if (!range.node || !editorRoot.contains(range.node)) {
		throw new Error("computePos: no such node or out of bounds")
	}

	// // NOTE: Gecko/Firefox can select the end element node
	// if (node.nodeType === Node.ELEMENT_NODE && offset && !(offset < node.childNodes.length)) {
	// 	node = null
	// 	offset = 0
	// }

	// Iterate to the deepest node:
	//
	// FIXME: range.offset can be out of bounds
	while (range.node.nodeType === Node.ELEMENT_NODE && range.offset < range.node.childNodes.length) {
		range.node = range.node.childNodes[range.offset]
		range.offset = 0
	}

	// // Iterate to the deepest node:
	// while (range.node.nodeType === Node.ELEMENT_NODE && range.node.childNodes.length) {
	// 	range.node = range.node.childNodes[range.offset]
	// 	range.offset = 0
	// }

	const recurse = on => {
		if (on === range.node) {
			Object.assign(pos, {
				x: pos.x + range.offset,
				pos: pos.pos + range.offset,
			})
			return true
		}
		for (const each of on.childNodes) {
			if (recurse(each)) {
				return true
			}
			const { length } = each.nodeValue || ""
			Object.assign(pos, {
				x: pos.x + length,
				pos: pos.pos + length,
			})
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-codex-node") || next.getAttribute("data-codex-root"))) {
				Object.assign(pos, {
					x: 0,
					y: pos.y + 1,
					pos: pos.pos + 1,
				})
			}
		}
		return false
	}
	recurse(editorRoot)
	return pos
}

// Computes cursor data structures.
function computePosRange(editorRoot) {
	const range = document.getSelection().getRangeAt(0)
	const range1 = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePos(editorRoot, range1)
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		const range2 = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePos(editorRoot, range2)
	}
	return [pos1, pos2]
}

export default computePosRange
