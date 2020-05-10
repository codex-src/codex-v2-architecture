// import { ascendRoot } from "./ascendNodes"
import { newPos } from "./constructors"

// // Computes a cursor data structure based on the VDOM.
// //
// // NOTE: Does not compute pos.x; see computeDOMPos.
// function computeVDOMPos(editorState) {
// 	const { extPosRange: [id], nodes } = editorState
// 	// Extended pos range not computed:
// 	const pos = newPos()
// 	if (!id) {
// 		return pos
// 	}
// 	// Extended pos range computed:
// 	for (let y = 0; y < nodes.length; y++) {
// 		if (id === nodes[y].id) {
// 			pos.y = y
// 			break
// 		}
// 		pos.pos += nodes[y].data.length
// 	}
// 	return pos
// }

// Computes a cursor data structure based on the DOM.
// rootOffset offsets data-codex-root elements.
function computeDOMPos(editorRoot /* , rootOffset */, { node, offset }) {
	console.log(editorRoot, node, offset)

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
		// let { childNodes } = on
		// if (offset) {
		// 	childNodes = [...on.childNodes].slice(offset)
		// }
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
	// recurse(editorRoot, rootOffset)
	recurse(editorRoot)
	return pos
}

// Merges two cursor data structures.
function mergePos(pos1, pos2) {
	Object.assign(pos1, {
		x: pos1.x + pos2.x,
		y: pos1.y + pos2.y,
		pos: pos1.pos + pos2.pos,
	})
}

// // Computes a cursor data structure based on merging the
// // VDOM and DOM computations.
// function computePos(editorState, editorRoot, range) {
// 	// const pos = computeVDOMPos(editorState)
//
// 	// const pos = newPos()
// 	// const extPos = computeDOMPos(editorRoot, 0, range)
// 	// mergePos(pos, extPos)
//
// 	return computeDOMPos(editorRoot, 0, range)
// }

// Computes cursor data structures.
//
// TODO: Rename extPosRange to extPosIDs?
function computePosRange(editorState, editorRoot) {
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		throw new Error("computePosRange: no such selection")
	}
	// // Compute data-codex-root elements:
	// const range = selection.getRangeAt(0)
	// const rootElement1 = ascendRoot(range.startContainer)
	// let rootElement2 = rootElement1
	// if (!range.collapsed) {
	// 	rootElement2 = ascendRoot(range.endContainer)
	// }
	// Compute cursor data structures:

	const range = selection.getRangeAt(0)
	const pos1 = computeDOMPos(editorRoot, { node: range.startContainer, offset: range.startOffset })
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		pos2 = computeDOMPos(editorRoot, { node: range.endContainer, offset: range.endOffset })
	}

	console.log(pos1)

	return [pos1, pos2]
}

export default computePosRange
