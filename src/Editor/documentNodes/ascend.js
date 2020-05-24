import { isDocumentNode } from "./test"

// Node    -> Element
// Element -> No-op
//
export function ascendToElement(node) {
	if (node && node.nodeType && node.nodeType !== Node.ELEMENT_NODE && node.parentElement) {
		return node.parentElement
	}
	return node
}

// Ascends to the nearest document node.
export function ascendToDocumentNode(node) {
	let element = ascendToElement(node)
	while (element && !isDocumentNode(element) && element.parentElement) {
		element = element.parentElement
	}
	return element
}
