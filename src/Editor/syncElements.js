// Replaces attributes (on element dst). Non-overlapping
// attributes are removed. Returns whether an attribute was
// replaced or removed.
export function replaceAttributes(src, dst) {
	const attrKeys = new Set()
	for (const attr of [...src.attributes, ...dst.attributes]) {
		attrKeys.add(attr.nodeName)
	}
	let replaced = false
	for (const key of attrKeys) {
		const value = src.getAttribute(key)
		if (value === null || value === dst.getAttribute(key)) {
			if (value === null) {
				dst.removeAttribute(key)
				replaced = true
			}
			// No-op
			continue
		}
		dst.setAttribute(key, value)
		replaced = true
	}
	return replaced
}

// Syncs two nodes; non-recursive. Returns isEqualNode.
export function syncNodes(src, dst) {
	// Nodes are the same; do nothing:
	if (dst.isEqualNode(src)) {
		return true
	}
	// Text handling:
	if (src.nodeType === Node.TEXT_NODE && src.nodeType === dst.nodeType) {
		dst.nodeValue = src.nodeValue
		return true
	// Element handling (elements must be of the same type):
	} else if (src.nodeType === Node.ELEMENT_NODE && src.nodeType === dst.nodeType && src.nodeName === dst.nodeName) {
		// Did not replace; cannot be assumed to be the same:
		if (!replaceAttributes(src, dst)) {
			return false
		}
		// Did replace:
		return dst.isEqualNode(src)
	}
	// Text-to-element and element-to-text handling:
	const clonedElement = src.cloneNode(true)
	dst.replaceWith(clonedElement)
	return true
}

// Recursively syncs two elements. Note that event listeners
// are not reattached.
export function syncElements(src, dst) {

	if (syncNodes(src, dst)) {
		// No-op
		return
	}

	for (let x = 0; x < src.childNodes.length; x++) {
		if (x < dst.childNodes.length) {
			syncElements(src.childNodes[x], dst.childNodes[x])
			continue
		}
		// src has too many elements:
		const clonedElement = src.childNodes[x].cloneNode(true)
		dst.insertBefore(clonedElement, dst.children[x - 1])
	}
	// for (let x = src.childNodes.length - 1; x < dst.childNodes.length; x++) {
	// 	// dst has too many elements:
	// 	dst.childNodes[x].remove()
	// }
}
