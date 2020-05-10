import { ascendRoot } from "./ascendNodes"
import { newPos } from "./constructors"

// Computes a cursor data structure based on the DOM. Uses
// childrenOffset to offset data-codex-root elements.
function computeDOMPos(editorRoot, childrenOffset, { node, offset }) {
	// Iterate to the deepest node:
	const pos = newPos()
	while (node.nodeType === Node.ELEMENT_NODE && offset < node.childNodes.length) {
		node = node.childNodes[offset]
		offset = 0
	}
	const recurse = (on, childrenOffset) => { // Shadows childrenOffset on purpose
		if (on === node) {
			Object.assign(pos, {
				x: pos.x + offset,
				pos: pos.pos + offset,
			})
			return true
		}
		let { childNodes } = on
		if (childrenOffset) {
			childNodes = [...on.children].slice(childrenOffset)
		}
		for (const each of childNodes) {
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
	recurse(editorRoot, childrenOffset)
	return pos
}

// Merges two cursor data structures.
function mergePos(src, dst) {
	Object.assign(dst, {
		x: dst.x + src.x,
		y: dst.y + src.y,
		pos: dst.pos + src.pos,
	})
}

// Computes a cursor data structure by merging the returns
// computeVDOMPos and computeDOMPos
function computePos(editorState, editorRoot, range) {
	const { nodes } = editorState

	// Compute extended ID; extend up to two data-codex-root
	// elements backwards:
	let rootElement = ascendRoot(range.node)
	let prev = rootElement.previousElementSibling
	if (prev && prev.getAttribute("data-codex-root")) {
		rootElement = prev
		prev = rootElement.previousElementSibling
		if (prev && prev.getAttribute("data-codex-root")) {
			rootElement = prev
		}
	}
	const extID = rootElement.id

	if (!extID) {
		throw new Error("computePos: no such extID")
	}

	// Attempt to precompute a cursor data structure based on
	// VDOM nodes:
	const pos = newPos()
	if (extID) {
		for (let y = 0; y < nodes.length; y++) {
			if (extID === nodes[y].id) {
				// No-op
				break
			}
			pos.pos += nodes[y].data.length
			if (y + 1 < nodes.length) {
				Object.assign(pos, { // Based on computeDOMPos
					y: pos.y + 1,
					pos: pos.pos + 1,
				})
			}
		}
	}
	// Compute data-codex-root element offset for
	// computeDOMPos (based on extID):
	let childrenOffset = 0
	if (extID) {
		childrenOffset = [...editorRoot.children].findIndex(each => each.id === extID)
	}

	// // Compares two cursor data structures.
	// const comparePos = (pos1, pos2) => {
	// 	const ok = (
	// 		pos1.x === pos2.x &&
	// 		pos1.y === pos2.y &&
	// 		pos1.pos === pos2.pos
	// 	)
	// 	return ok
	// }

	// Compute cursor data structure based on the DOM; use
	// childrenOffset to offset data-codex-root elements:
	const domPos = computeDOMPos(editorRoot, childrenOffset, range)
	// Merge cursor data structures (merges to pos):
	mergePos(domPos, pos)
	return pos
}

// Computes cursor data structures.
function computePosRange(editorState, editorRoot) {
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		throw new Error("computePosRange: no such selection")
	}
	const range = selection.getRangeAt(0)
	const pos1 = computePos(editorState, editorRoot, { node: range.startContainer, offset: range.startOffset })
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		pos2 = computePos(editorState, editorRoot, { node: range.endContainer, offset: range.endOffset })
	}
	return [pos1, pos2]
}

export default computePosRange
