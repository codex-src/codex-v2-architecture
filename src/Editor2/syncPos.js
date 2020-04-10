// // Computes the DOM element root ID and offset from a range
// // data structure.
// function computeUUIDAndOffsetFromRange(editorRoot, range) {
// 	// if (!range.node && !range.offset) {
// 	// 	return { id: "", offset: "" }
// 	// }
//
// 	let { node } = range
// 	while (node.nodeType !== Node.ELEMENT_NODE || !node.id) {
// 		node = node.parentNode
// 	}
// 	const elementRoot = node
// 	const { id } = elementRoot
// 	// Recursively counts the offset from an element to a
// 	// range node and offset.
// 	let offset = 0
// 	const recurse = element => {
// 		for (const each of element.childNodes) {
// 			if (each === range.node) {
// 				offset += range.offset
// 				// Stop recursion:
// 				return true
// 			}
// 			offset += (each.nodeValue || "").length
// 			if (recurse(each)) {
// 				// Stop recursion:
// 				return true
// 			}
// 			// NOTE: Use next.getAttribute instead of next.id
// 			// because next.id always returns ""
// 			const next = each.nextElementSibling
// 			if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
// 				offset++
// 			}
// 		}
// 		return false
// 	}
// 	recurse(elementRoot)
// 	return { id, offset }
// }
//
// // Computes a range data structure from a cursor data
// // structure.
// //
// // NOTE: Don’t mutate pos -- copy
// function computeRangeFromPos(editorRoot, { ...pos }) {
// 	const elementRoot = document.getElementById(pos.id)
// 	if (!elementRoot) {
// 		throw new Error("computeRangeFromPos: no such uuid element")
// 	}
//
// 	let node = null
// 	let offset = 0
// 	const recurse = element => {
// 		for (const each of element.childNodes) {
// 			const { length } = each.nodeValue || ""
// 			if (pos.offset - length <= 0) {
// 				node = each
// 				offset = pos.offset
// 				// Stop recursion:
// 				return true
// 			}
// 			pos.offset -= length
// 			if (recurse(each)) {
// 				// Stop recursion:
// 				return true
// 			}
// 			// NOTE: Use next.getAttribute instead of next.id
// 			// because next.id always returns ""
// 			const next = each.nextElementSibling
// 			if (next && (next.getAttribute("data-node") || next.getAttribute("data-root"))) {
// 				pos.offset--
// 			}
// 		}
// 		return false
// 	}
// 	recurse(elementRoot)
// 	return { node, offset }
// }
//
// // Compares two cursor data structures.
// function posAreSame(pos1, pos2) {
// 	const ok = (
// 		pos1.id === pos2.id &&
// 		pos1.offset === pos2.offset
// 	)
// 	return ok
// }
//
// // Returns whether cursor data structures are empty.
// function posAreEmpty(pos1, pos2) {
// 	return [pos1, pos2].every(each => !each.id && !each.offset)
// }
//
// // Synchronizes the DOM cursor to cursor data structures.
// //
// // TODO: Guard !selection.rangeCount?
// function syncPos(editorRoot, pos1, pos2) {
// 	if (posAreEmpty(pos1, pos2)) {
// 		// No-op
// 		return
// 	}
// 	// Get the cursor data structures from the DOM cursors:
// 	const selection = document.getSelection()
// 	if (selection.rangeCount) {
// 		const range = selection.getRangeAt(0)
// 		const domPos1 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.startContainer, offset: range.startOffset })
// 		let domPos2 = { ...domPos1 }
// 		if (!range.collapsed) {
// 			domPos2 = computeUUIDAndOffsetFromRange(editorRoot, { node: range.endContainer, offset: range.endOffset })
// 		}
// 		// Compare the VDOM cursor data structures to the DOM data
// 		// structures:
// 		if (posAreSame(pos1, domPos1) && posAreSame(pos2, domPos2)) {
// 			// No-op
// 			return
// 		}
// 	}
// 	// Synchronize the DOM cursor to the VDOM cursor data
// 	// structures:
// 	const range = document.createRange()
// 	const r1 = computeRangeFromPos(editorRoot, pos1)
// 	range.setStart(r1.node, r1.offset)
// 	range.collapse()
// 	let r2 = { ...r1 }
// 	if (!posAreSame(pos1, pos2)) {
// 		r2 = computeRangeFromPos(editorRoot, pos2)
// 		range.setEnd(r2.node, r2.offset)
// 	}
// 	// // NOTE: syncTrees eagerly calls removeAllRanges
// 	// if (selection.rangeCount) {
// 	// 	selection.removeAllRanges()
// 	// }
// 	selection.addRange(range)
// }
