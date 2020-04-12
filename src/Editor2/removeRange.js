// @flow

// Removes the range (for performance reasons).
//
// https://bugs.chromium.org/p/chromium/issues/detail?id=138439#c10
function removeRange() {
	const selection = document.getSelection()
	if (!selection) {
		// No-op
		return
	}
	if (!selection.rangeCount) {
		// No-op
		return
	}
	selection.removeAllRanges()
}

export default removeRange
