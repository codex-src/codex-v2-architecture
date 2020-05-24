// Returns whether an element is a data-codex-node or
// data-codex-root element.
export function isDocumentNode(element) {
	return element.id
}

// Returns whether an element is a data-codex-root element.
export function isDocumentRoot(element) {
	const ok = (
		element.id &&
		element.parentElement.getAttribute("data-codex-editor")
	)
	return ok
}
