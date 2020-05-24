import { isDocumentNode } from "./documentNodes"

// Node    -> Element
// Element -> No-op
//
//
// TODO: Rename to ascendToElement?
export function ascendElement(node) {
	if (node && node.nodeType && node.nodeType !== Node.ELEMENT_NODE && node.parentElement) {
		return node.parentElement
	}
	return node
}

// Ascends to the nearest data-codex-node or data-codex-root
// element.
//
// TODO: Rename to ascendToNode?
export function ascendNode(node) {
	let element = ascendElement(node)
	while (element && !isDocumentNode(element) && element.parentElement) {
		element = element.parentElement
	}
	return element
}
