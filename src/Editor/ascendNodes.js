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
export function ascendNode(node) {
	let element = ascendToElement(node)
	while (element && element.parentElement && !(element.getAttribute("data-codex-node") || element.getAttribute("data-codex-root"))) {
		element = element.parentElement
	}
	return element
}

// Ascends to the nearest data-codex-root element.
export function ascendRoot(node) {
	let element = ascendToElement(node)
	while (element && element.parentElement && !element.getAttribute("data-codex-root")) {
		element = element.parentElement
	}
	return element
}
