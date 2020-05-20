import { ascendRoot } from "./ascenders"
import { newPos } from "./constructors"

// Computes a cursor data structure from the DOM.
function computeDOMPos(root, { node, offset }) {
	// Iterate to the deepest node:
	const pos = newPos()
	while (node.nodeType === Node.ELEMENT_NODE && offset < node.childNodes.length) {
		node = node.childNodes[offset]
		offset = 0
	}
	const recurse = on => {
		if (on === node) {
			Object.assign(pos, {
				x: pos.x + offset,
				pos: pos.pos + offset,
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
	recurse(root)
	return pos
}

// Sums VDOM- and DOM-computed cursor data structures.
function newMetaPos(vdomPos, domPos) {
	const pos = newPos()
	Object.assign(pos, {
		x: vdomPos.x + domPos.x,
		y: vdomPos.y + domPos.y,
		pos: vdomPos.pos + domPos.pos,
	})
	return pos
}

// Computes a meta cursor data structure; sums VDOM- and
// DOM-computed data structures.
function computeMetaPos(editorState, editorRoot, { node, offset }) {
	const vdomPos = newPos()
	const root = ascendRoot(node)
	for (const each of editorState.nodes) {
		if (each.id === root.id) {
			// No-op
			break
		}
		vdomPos.y++
		vdomPos.pos += (each.data + "\n").length
	}
	const domPos = computeDOMPos(root, { node, offset })
	return newMetaPos(vdomPos, domPos)
}

// Computes a range of cursor data structures.
function computePosRange(editorState, editorRoot) {
	const selection = document.getSelection()
	if (!selection || !selection.rangeCount) {
		throw new Error("computePosRange: !selection || !selection.rangeCount")
	}
	const range = selection.getRangeAt(0)
	const pos1 = computeMetaPos(editorState, editorRoot, { node: range.startContainer, offset: range.startOffset })
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		pos2 = computeMetaPos(editorState, editorRoot, { node: range.endContainer, offset: range.endOffset })
	}
	return [pos1, pos2]
}

export default computePosRange
