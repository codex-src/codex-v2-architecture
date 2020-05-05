import {
	ascendNode,
	ascendRoot,
} from "./ascendNodes"

// Ascends to the nearest scrolling element.
//
// NOTE: Use + 2 for ± 1 offsets
//
// +---+ ± 1
// | y |
// +---+ ± 1
//
const ascendToScrollingElement = element => {
	while (element && !(element.scrollHeight > element.offsetHeight + 2)) {
		element = element.parentElement
	}
	// Guard <div id="root" class="h-full">:
	if (element.parentElement && element.parentElement.nodeName === "BODY") {
		return element.ownerDocument.scrollingElement
	}
	return element
}

// Computes the scrolling element and offset (y-axis only).
function computeScrollingElementAndOffset(offsetTop = 0, offsetBottom = 0) {
	// Decrement offsets because of ± 1 offset:
	offsetTop--
	offsetBottom--
	const selection = document.getSelection()
	if (!selection.rangeCount) {
		return null
	}
	const range = selection.getRangeAt(0)
	const scrollingElement = ascendToScrollingElement(ascendRoot(range.commonAncestorContainer))
	let { top: scrollTop, bottom: scrollBottom } = scrollingElement.getBoundingClientRect()
	if (scrollingElement.nodeName === "HTML") {
		scrollTop = 0
		scrollBottom = window.innerHeight
	}
	const startElement = ascendNode(range.startContainer)
	const { top } = startElement.getBoundingClientRect()
	const endElement = ascendNode(range.endContainer)
	const { bottom } = endElement.getBoundingClientRect()
	//
	// +---+ <- here and
	// +---+
	// | y |
	// +---+
	// +---+ <- here
	//
	if (top - offsetTop < scrollTop && bottom + offsetBottom > scrollBottom) {
		return null
	}
	//
	// +---+ <- here
	// +---+
	// | y |
	// +---+
	//
	let offset = 0
	if (top - offsetTop < scrollTop) {
		offset = -1 * (scrollTop - top + offsetTop)
	//
	// +---+
	// | y |
	// +---+
	// +---+ <- here
	//
	} else if (bottom + offsetBottom > scrollBottom) {
		offset = -1 * (scrollBottom - bottom - offsetBottom)
	}
	return { scrollingElement, offset }
}

export default computeScrollingElementAndOffset
