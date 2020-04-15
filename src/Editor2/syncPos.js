import computePosRange from "./computePosRange"

// Computes a range data structure. Code based on
// computePosRange.countOffset.
function computeRange(editorRoot, pos) {
	// NOTE: Copy pos -- do not mutate reference
	pos = { root: { ...pos.root } }

	const root = document.getElementById(pos.root.id)
	if (!root || !editorRoot.contains(root)) {
		throw new Error("computeRange: no such root or out of bounds")
	}
	let node = null
	let offset = 0
	const recurse = on => {
		if (pos.root.offset - (on.nodeValue || "").length <= 0) {
			node = on
			offset = pos.root.offset
			return true
		}
		for (const each of on.childNodes) {
			if (recurse(each)) {
				return true
			}
			pos.root.offset -= (each.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				pos.root.offset--
			}
		}
		return false
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
	if (!selection.rangeCount) {
		// No-op; defer to end
	} else {
		const [domPos1, domPos2] = computePosRange(editorRoot)
		if (areEqual(domPos1, pos1) && areEqual(domPos2, pos2)) {
			return false
		}
	}
	const range1 = computeRange(editorRoot, pos1)
	let range2 = { ...range1 }
	if (pos1.root.id !== pos2.root.id || pos1.root.offset !== pos2.root.offset) {
		range2 = computeRange(editorRoot, pos2)
	}
	const domRange = document.createRange()
	console.log(range1, range2)
	domRange.setStart(range1.node, range1.offset)
	domRange.setEnd(range2.node, range2.offset)
	selection.removeAllRanges()
	selection.addRange(domRange)
	return true
}

export default syncPos
