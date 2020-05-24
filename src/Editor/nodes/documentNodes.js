// Returns whether a node is a data-codex-node or
// data-codex-root element.
export function isDocumentNode(node) {
	const ok = (
		node.nodeType == Node.ELEMENT_NODE &&
		node.id
	)
	return ok
}

// Returns whether a node is a data-codex-root element.
export function isDocumentRoot(node) {
	const ok = (
		node.nodeType === Node.ELEMENT_NODE &&
		node.parentElement &&
		node.parentElement.getAttribute("data-codex-editor")
	)
	return ok
}
