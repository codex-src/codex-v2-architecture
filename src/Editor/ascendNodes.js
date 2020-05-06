// Ascends to the nearest element.
function ascendToElement(node) {
	let element = node
	if (node.nodeType !== Node.ELEMENT_NODE) {
		element = node.parentElement
	}
	return element
}

// Ascends to the nearest data-codex-node or data-codex-root
// element.
//
// TODO: Add bounds check e.g. add editorRoot as a parameter
export function ascendNode(node) {
	// FIXME
	node = ascendToElement(node)
	while (node && node.parentElement && (
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
	// FIXME
	node = ascendToElement(node)
	while (node && node.parentElement && (!node.getAttribute || !node.getAttribute("data-codex-root"))) {
		node = node.parentElement
	}
	return node
}
