import computePosRange from "./computePosRange"
import { newRange } from "./constructors"

// Computes a range data strucutre.
function computeRange(editorRoot, { pos }) {
	const range = newRange()
	const recurse = on => {
		if (pos - (on.nodeValue || "").length <= 0) {
			Object.assign(range, {
				node: on,
				offset: pos,
			})
			return true
		}
		for (const each of on.childNodes) {
			if (recurse(each)) {
				return true
			}
			pos -= (each.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-codex-node") || next.getAttribute("data-codex-root"))) {
				pos--
			}
		}
		return false
	}
	recurse(editorRoot)
	// TODO: Error on empty ranges?
	return range
}

// Synchronizes DOM cursors.
function syncPos(editorRoot, [pos1, pos2]) {
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		// No-op; defer to end
	} else {
		const [domPos1, domPos2] = computePosRange(editorRoot)
		if (domPos1.pos === pos1.pos && domPos2.pos === pos2.pos) {
			return false
		}
	}
	const r1 = computeRange(editorRoot, pos1)
	let r2 = { ...r1 }
	if (pos2.pos !== pos1.pos) {
		r2 = computeRange(editorRoot, pos2)
	}
	const range = document.createRange()
	range.setStart(r1.node, r1.offset)
	range.setEnd(r2.node, r2.offset)
	selection.removeAllRanges()
	selection.addRange(range)
	return true
}

export default syncPos
