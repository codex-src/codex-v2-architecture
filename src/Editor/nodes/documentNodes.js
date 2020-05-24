// Returns whether a node is a document node.
export function isDocumentNode(node) {
	const ok = (
		node.nodeType === Node.ELEMENT_NODE &&
		node.id
	)
	return ok
}
