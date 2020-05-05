// Returns whether a node is a list item element.
export function isListItemElement(node) {
	const ok = (
		node &&
		node.nodeType === Node.ELEMENT_NODE &&
		node.nodeName === "LI"
	)
	return ok
}

// Returns whether a node is a list element.
export function isListElement(node) {
	const ok = (
		node &&
		node.nodeType === Node.ELEMENT_NODE &&
		(node.nodeName === "UL" || node.nodeName === "OL")
	)
	return ok
}
