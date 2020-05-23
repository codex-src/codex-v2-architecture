// Returns whether an element is a data-codex-node or
// data-codex-root element.
export function isNode(element) {
	// const ok = (
	// 	element.getAttribute("data-codex-node") ||
	// 	element.getAttribute("data-codex-root")
	// )
	// return ok

	return element.id
}

// Returns whether an element is a data-codex-root element.
export function isRoot(element) {
	// return element.getAttribute("data-codex-root")

	const ok = (
		element.id &&
		element.parentElement.classList.contains("codex-editor")
	)
	return ok
}
