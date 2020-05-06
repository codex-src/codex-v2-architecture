// // Naively syncs two trees.
// function syncDOM(src, dst) {
// 	removeRange()
// 	;[...dst.children].reverse().map(each => each.remove())
// 	dst.append(...src.cloneNode(true).children)
// 	return true
// }

// Removes the range (for performance reasons).
//
// https://bugs.chromium.org/p/chromium/issues/detail?id=138439#c10
function removeRange() {
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		// No-op
		return
	}
	selection.removeAllRanges()
}

// Syncs two DOM trees; elements are cloned and replaced
// forwards and then backwards. Note that the root elements
// are not synced.
//
// TODO: Reduce mutations from 2 to 1 for the 90% case
function syncDOM(src, dst, decorator = null) {
	let mutations = 0
	// Iterate forwards (before replaceWith):
	let start = 0
	const min = Math.min(dst.children.length, src.children.length)
	for (; start < min; start++) {
		if (!dst.children[start].isEqualNode(src.children[start])) {
			if (!mutations) {
				removeRange()
			}
			const originalElement = src.children[start]
			const clonedElement = originalElement.cloneNode(true)
			dst.children[start].replaceWith(clonedElement)
			if (decorator) {
				decorator(originalElement, clonedElement)
			}
			mutations++
			start++ // Eagerly increment
			break
		}
	}
	// Iterate backwards (after replaceWith):
	let end1 = dst.children.length
	let end2 = src.children.length
	if (mutations) { // Not needed but easier to understand
		for (; end1 > start && end2 > start; end1--, end2--) {
			if (!dst.children[end1 - 1].isEqualNode(src.children[end2 - 1])) {
				if (!mutations) {
					removeRange()
				}
				const originalElement = src.children[end2 - 1]
				const clonedElement = originalElement.cloneNode(true)
				dst.children[end1 - 1].replaceWith(clonedElement)
				if (decorator) {
					decorator(originalElement, clonedElement)
				}
				mutations++
			}
		}
	}
	// Drop extraneous elements:
	if (start < end1) {
		for (; start < end1; end1--) { // Iterate backwards
			if (!mutations) {
				removeRange()
			}
			dst.children[end1 - 1].remove()
			mutations++
		}
	// Push extraneous elements:
	} else if (start < end2) {
		for (; start < end2; start++) {
			if (!mutations) {
				removeRange()
			}
			const originalElement = src.children[start]
			const clonedElement = originalElement.cloneNode(true)
			dst.insertBefore(clonedElement, dst.children[start])
			if (decorator) {
				decorator(originalElement, clonedElement)
			}
			mutations++
		}
	}
	return mutations
}

export default syncDOM
