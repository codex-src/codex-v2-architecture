// import removeRange from "./removeRange"
import computePosRange from "./computePosRange"

// Computes a range data structure. Code based on
// computePosRange.countOffset.
function computeRange(editorRoot, pos) {
	// NOTE: Copy pos:
	pos = { root: { ...pos.root } }

	const root = document.getElementById(pos.root.id)
	if (!root || !editorRoot.contains(root)) {
		throw new Error("computeRange: no such root or out of bounds")
	}
	let node = null
	let offset = 0
	const recurse = any => {
		// if ((any.nodeValue || "").length <= 0) {
		const { length } = any.nodeValue || ""
		if (pos.root.offset - length <= 0) {
			node = any
			offset = pos.root.offset
			return true
		}
		for (const each of any.childNodes) {
			if (recurse(each)) {
				return true
			}
			// offset += (node.nodeValue || "").length
			pos.root.offset -= (each.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				pos.root.offset--
			}
		}
		return false

		// const { length } = any.nodeValue || ""
		// if (pos.root.offset - length <= 0) {
		// 	node = any
		// 	offset = pos.root.offset // offset becomes pos.root.offset; the remainder
		// 	return true
		// }
		// for (const each of any.childNodes) {
		// 	if (recurse(each)) {
		// 		return true
		// 	}
		// 	pos.root.offset -= length
		// 	const next = each.nextElementSibling
		// 	if (next && next.getAttribute("data-node")) {
		// 		offset--
		// 	}
		// }
		// return false
	}
	recurse(root)
	return { node, offset }
}

// Compares two cursor data structures (compares root).
function areEqual(pos1, pos2) {
	const ok = (
		pos1.root.id === pos2.root.id &&
		pos1.root.offset === pos2.root.offset
	)
	return ok
}

// Synchronizes DOM cursors.
function syncPos(editorRoot, [pos1, pos2]) {
	const selection = document.getSelection()
	if (!selection.rangeCount) { // NOTE: Do not remove; needed to guard computePosRange
		// No-op; defer to end
	} else {
		const [domPos1, domPos2] = computePosRange(editorRoot)
		if (areEqual(domPos1, pos1) && areEqual(domPos2, pos2)) {
			return false
		}
	}
	const startRange = computeRange(editorRoot, pos1)
	let endRange = { ...startRange }
	if (pos1.root.id !== pos2.root.id || pos1.root.offset !== pos2.root.offset) {
		endRange = computeRange(editorRoot, pos2)
	}
	const range = document.createRange()
	range.setStart(startRange.node, startRange.offset)
	range.setEnd(endRange.node, endRange.offset)
	selection.removeAllRanges()
	selection.addRange(range)
	return true
}

export default syncPos
