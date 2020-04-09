// // Naively syncs two trees.
// function naiveSyncTrees(treeA, treeB) {
// 	eagerlyDropRange()
// 	;[...treeA.childNodes].reverse().map(each => each.remove())
// 	treeA.append(...treeB.cloneNode(true).childNodes)
// 	return treeA.childNodes.length
// }

// Eagerly drops the range (for performance reasons).
//
// https://bugs.chromium.org/p/chromium/issues/detail?id=138439#c10
function eagerlyDropRange() {
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		// No-op
		return
	}
	selection.removeAllRanges()
}

// Syncs two DOM trees (elements); DOM nodes are
// incrementally cloned and replaced forwards and then
// backwards. Note that the root nodes are not synced.
//
// TODO: Reduce the number of mutations for the 90% case
// from 2 to 1
function syncTrees(treeA, treeB) {
	let mutations = 0
	// Iterate forwards (before replaceWith):
	let start = 0
	const min = Math.min(treeA.childNodes.length, treeB.childNodes.length)
	for (; start < min; start++) {
		if (!treeA.childNodes[start].isEqualNode(treeB.childNodes[start])) {
			if (!mutations) {
				eagerlyDropRange()
			}
			const newNode = treeB.childNodes[start].cloneNode(true)
			treeA.childNodes[start].replaceWith(newNode)
			mutations++
			start++ // Eagerly increment because of break
			break
		}
	}
	// Iterate backwards (after replaceWith):
	let end1 = treeA.childNodes.length
	let end2 = treeB.childNodes.length
	if (mutations) { // Not needed but easier to understand
		for (; end1 > start && end2 > start; end1--, end2--) {
			if (!treeA.childNodes[end1 - 1].isEqualNode(treeB.childNodes[end2 - 1])) {
				if (!mutations) {
					eagerlyDropRange()
				}
				const newNode = treeB.childNodes[end2 - 1].cloneNode(true)
				treeA.childNodes[end1 - 1].replaceWith(newNode)
				mutations++
			}
		}
	}
	// Drop extraneous DOM nodes:
	if (start < end1) {
		for (; start < end1; end1--) { // Iterate backwards
			if (!mutations) {
				eagerlyDropRange()
			}
			treeA.childNodes[end1 - 1].remove()
			mutations++
		}
	// Push extraneous DOM nodes:
	} else if (start < end2) {
		for (; start < end2; start++) {
			if (!mutations) {
				eagerlyDropRange()
			}
			const newNode = treeB.childNodes[start].cloneNode(true)
			treeA.insertBefore(newNode, treeA.childNodes[start])
			mutations++
		}
	}
	return mutations
}

export default syncTrees
