// Ascends to the nearest data-codex-node or data-codex-root
// element.
//
// TODO: Add bounds check e.g. add editorRoot as a parameter
export function ascendNode(node) {
	while (node && (
		!node.getAttribute || (
			!node.getAttribute("data-codex-node") &&
			!node.getAttribute("data-codex-root")
		)
	)) {
		node = node.parentElement
	}
	return node
}

// Ascends to the nearest data-codex-root element.
//
// TODO: Add bounds check e.g. add editorRoot as a parameter
export function ascendRoot(node) {
	while (node && (!node.getAttribute || !node.getAttribute("data-codex-root"))) {
		node = node.parentElement
	}
	return node
}
