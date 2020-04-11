// Computes the DOM element root ID and offset from a range
// data structure.
function computeUUIDAndOffsetFromRange(editorRoot, range) {
	// if (!range.node && !range.offset) {
	// 	return { id: "", offset: "" }
	// }

	let { node } = range
	while (node.nodeType !== Node.ELEMENT_NODE || !node.id) {
		node = node.parentNode
	}
	const root = node
	const { id } = root
	// Recursively counts the offset from an element to a
	// range node and offset.
	let offset = 0
	const recurse = element => {
		for (const each of element.childNodes) {
			if (each === range.node) {
				offset += range.offset
				return true
			}
			offset += (each.nodeValue || "").length
			if (recurse(each)) {
				return true
			}
			// NOTE: Use next.getAttribute instead of next.id
			// because next.id always returns ""
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
				offset++
			}
		}
		return false
	}
	recurse(root)
	return { id, offset }
}

// Computes a range data structure.
function computeRange(editorRoot, { ...pos }) {
	const root = document.getElementById(pos.root.id)
	if (!root || !editorRoot.contains(root)) {
		throw new Error("computeRange: no such root or out of bounds")
	}
	let node = null
	let offset = 0
	const recurse = element => {
		for (const each of element.childNodes) {
			const { length } = each.nodeValue || ""
			if (pos.root.offset - length <= 0) {
				node = each
				offset = pos.root.offset
				return true
			}
			pos.root.offset -= length
			if (recurse(each)) {
				return true
			}
			const next = each.nextElementSibling
			pos.root.offset -= Boolean(next && next.getAttribute("data-node"))
		}
		return false
	}
	recurse(root)
	return { node, offset }
}

// Compares two cursor data structures.
function posAreSame(pos1, pos2) {
	const ok = (
		pos1.id === pos2.id &&
		pos1.offset === pos2.offset
	)
	return ok
}

// Eagerly removes the range (for performance reasons).
//
// https://bugs.chromium.org/p/chromium/issues/detail?id=138439#c10
function eagerlyRemoveRange() {
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		// No-op
		return
	}
	selection.removeAllRanges()
}

// Synchronizes the DOM cursor to cursor data structures.
function syncPos(editorRoot, [pos1, pos2]) {
	const selection = document.getSelection()

	// if (selection.rangeCount) {
	// 	const range = selection.getRangeAt(0)
	// 	const domPos1 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.startContainer, offset: range.startOffset })
	// 	let domPos2 = { ...domPos1 }
	// 	if (!range.collapsed) {
	// 		domPos2 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.endContainer, offset: range.endOffset })
	// 	}
	// 	// Compare the VDOM cursor data structures to the DOM data
	// 	// structures:
	// 	if (posAreSame(pos1, domPos1) && posAreSame(pos2, domPos2)) {
	// 		// No-op
	// 		return
	// 	}
	// }

	eagerlyRemoveRange()
	const range = document.createRange()
	const startRange = computeRange(editorRoot, pos1)
	let endRange = { ...startRange }
	if (!posAreSame(pos1, pos2)) {
		endRange = computeRange(editorRoot, pos2)
	}
	range.setStart(startRange.node, startRange.offset)
	range.setEnd(endRange.node, endRange.offset)
	selection.addRange(range)

	// if (!selection.rangeCount) {
	// 	eagerlyRemoveRange()
	// 	const range = document.createRange()
	// 	const startRange = computeRange(editorRoot, pos1)
	// 	let endRange = { ...startRange }
	// 	if (!posAreSame(pos1, pos2)) {
	// 		endRange = computeRange(editorRoot, pos2)
	// 	}
	// 	range.setStart(startRange.node, startRange.offset)
	// 	range.setEnd(endRange.node, endRange.offset)
	// 	selection.addRange(range)
	// 	return
	// }


	// // Get the cursor data structures from the DOM cursors:
	// const selection = document.getSelection()
	// if (selection.rangeCount) {
	// 	const range = selection.getRangeAt(0)
	// 	const domPos1 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.startContainer, offset: range.startOffset })
	// 	let domPos2 = { ...domPos1 }
	// 	if (!range.collapsed) {
	// 		domPos2 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.endContainer, offset: range.endOffset })
	// 	}
	// 	// Compare the VDOM cursor data structures to the DOM data
	// 	// structures:
	// 	if (posAreSame(pos1, domPos1) && posAreSame(pos2, domPos2)) {
	// 		// No-op
	// 		return
	// 	}
	// }
	// // Synchronize the DOM cursor to the VDOM cursor data
	// // structures:
	// const range = document.createRange()
	// const startRange = computeRange(editorRoot, pos1)
	// range.setStart(startRange.node, startRange.offset)
	// range.collapse()
	// let endRange = { ...startRange }
	// if (!posAreSame(pos1, pos2)) {
	// 	endRange = computeRange(editorRoot, pos2)
	// 	range.setEnd(endRange.node, endRange.offset)
	// }
	// // // NOTE: syncTrees eagerly calls removeAllRanges
	// // if (selection.rangeCount) {
	// // 	selection.removeAllRanges()
	// // }
	// selection.addRange(range)
}

export default syncPos
