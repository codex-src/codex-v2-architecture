import {
	ascendElement,
	ascendRoot,
} from "./ascenders"

// Ascends to the scrolling element. The scrolling element
// can be the nearest overflow-y-scroll element or the
// <html> element.
//
// NOTE: Use element.offsetHeight + 2 because edges are
// fuzzy to 1px
function ascendToScrollingElement(element) {
	// Ascend to the scrolling context:
	while (element && element.parentElement && !(element.scrollHeight > element.offsetHeight + 2)) {
		element = element.parentElement
	}
	// Ascend from <div id="root" class="h-full"> to <html>:
	if (element && element.parentElement && element.parentElement.nodeName === "BODY") {
		return element.ownerDocument.scrollingElement
	}
	return element
}

// Computes the y-axis scrolling element and offset.
function computeScrollingElementAndOffset(offsetTop = 0, offsetBottom = 0) {
	const selection = document.getSelection()
	if (!selection || !selection.rangeCount) {
		return null
	}
	const range = selection.getRangeAt(0)
	const scrollingElement = ascendToScrollingElement(range.commonAncestorContainer)
	let { top: scrollTop, bottom: scrollBottom } = scrollingElement.getBoundingClientRect()
	if (scrollingElement.nodeName === "HTML") {
		scrollTop = 0
		scrollBottom = window.innerHeight
	}
	const { top: elementTop } = ascendElement(range.startContainer).getBoundingClientRect()
	const { bottom: elementBottom } = ascendElement(range.endContainer).getBoundingClientRect()
	//
	// +===+ <- here and
	// +---+
	// | y |
	// +---+
	// +===+ <- here
	//
	// Decrement offsets because edges are fuzzy to 1px:
	offsetTop--
	offsetBottom--
	if (elementTop - offsetTop < scrollTop && elementBottom + offsetBottom > scrollBottom) {
		return null
	}
	//
	// +===+ <- here
	// +---+
	// | y |
	// +===+
	//
	let offset = 0
	if (elementTop - offsetTop < scrollTop) {
		offset = -1 * (scrollTop - elementTop + offsetTop)
	//
	// +---+
	// | y |
	// +---+
	// +===+ <- here
	//
	} else if (elementBottom + offsetBottom > scrollBottom) {
		offset = -1 * (scrollBottom - elementBottom - offsetBottom)
	}
	return { scrollingElement, offset }
}

export default computeScrollingElementAndOffset
