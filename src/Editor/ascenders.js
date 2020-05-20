// Node    -> Element
// Element -> No-op
//
function ascendElement(node) {
	if (node && node.nodeType && node.nodeType !== Node.ELEMENT_NODE && node.parentElement) {
		return node.parentElement
	}
	return node
}

// Ascends to the nearest data-codex-node or data-codex-root
// element.
export function ascendNode(node) {
	let element = ascendElement(node)
	while (element && element.parentElement && !(element.getAttribute("data-codex-node") || element.getAttribute("data-codex-root"))) {
		element = element.parentElement
	}
	return element
}

// Ascends to the nearest data-codex-root element.
export function ascendRoot(node) {
	let element = ascendElement(node)
	while (element && element.parentElement && !element.getAttribute("data-codex-root")) {
		element = element.parentElement
	}
	return element
}
