// // Naively syncs two trees.
// function naiveSyncTrees(dst, src) {
// 	removeRange()
// 	;[...dst.childNodes].reverse().map(each => each.remove())
// 	dst.append(...src.cloneNode(true).childNodes)
// 	return dst.childNodes.length
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

// Syncs two DOM trees; nodes are cloned and replaced
// forwards and then backwards. Note that the root elements
// are not synced.
//
// TODO: Reduce mutations from 2 to 1 for the 90% case
function syncDOM(src, dst) {
	let mutations = 0
	// Iterate forwards (before replaceWith):
	let start = 0
	const min = Math.min(dst.childNodes.length, src.childNodes.length)
	for (; start < min; start++) {
		if (!dst.childNodes[start].isEqualNode(src.childNodes[start])) {
			if (!mutations) {
				removeRange()
			}
			const newNode = src.childNodes[start].cloneNode(true)
			dst.childNodes[start].replaceWith(newNode)
			mutations++
			start++ // Eagerly increment
			break
		}
	}
	// Iterate backwards (after replaceWith):
	let end1 = dst.childNodes.length
	let end2 = src.childNodes.length
	if (mutations) { // Not needed but easier to understand
		for (; end1 > start && end2 > start; end1--, end2--) {
			if (!dst.childNodes[end1 - 1].isEqualNode(src.childNodes[end2 - 1])) {
				if (!mutations) {
					removeRange()
				}
				const newNode = src.childNodes[end2 - 1].cloneNode(true)
				dst.childNodes[end1 - 1].replaceWith(newNode)
				mutations++
			}
		}
	}
	// Drop extraneous nodes:
	if (start < end1) {
		for (; start < end1; end1--) { // Iterate backwards
			if (!mutations) {
				removeRange()
			}
			dst.childNodes[end1 - 1].remove()
			mutations++
		}
	// Push extraneous nodes:
	} else if (start < end2) {
		for (; start < end2; start++) {
			if (!mutations) {
				removeRange()
			}
			const newNode = src.childNodes[start].cloneNode(true)
			dst.insertBefore(newNode, dst.childNodes[start])
			mutations++
		}
	}
	return mutations
}

export default syncDOM
