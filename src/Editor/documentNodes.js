// Returns whether an element is a data-codex-node or
// data-codex-root element.
export function isNode(element) {
	return element.id
}

// Returns whether an element is a data-codex-root element.
export function isRoot(element) {
	const ok = (
		element.id &&
		element.parentElement.getAttribute("data-codex-root")
	)
	return ok
}
