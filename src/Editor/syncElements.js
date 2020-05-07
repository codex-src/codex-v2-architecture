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
	const clonedNode = src.cloneNode(true)
	dst.replaceWith(clonedNode)
	return true
}

// export function syncElements(src, dst) {
// 	// Iterate forwards (before replaceWith):
// 	let start = 0
// 	const min = Math.min(dst.children.length, src.children.length)
// 	for (; start < min; start++) {
// 		if (!dst.children[start].isEqualNode(src.children[start])) {
// 			// syncElements(src.children[start], dst.children[start])
// 			const clonedElement = src.children[start].cloneNode(true)
// 			dst.children[start].replaceWith(clonedElement)
// 			start++ // Eagerly increment
// 			break
// 		}
// 	}
// 	// Iterate backwards (after replaceWith):
// 	let end1 = dst.children.length
// 	let end2 = src.children.length
// 	for (; end1 > start && end2 > start; end1--, end2--) {
// 		if (!dst.children[end1 - 1].isEqualNode(src.children[end2 - 1])) {
// 			// syncElements(src.children[end2 - 1], dst.children[end1 - 1])
// 			const clonedElement = src.children[end2 - 1].cloneNode(true)
// 			dst.children[end1 - 1].replaceWith(clonedElement)
// 		}
// 	}
// 	// Drop extraneous elements:
// 	if (start < end1) {
// 		for (; start < end1; end1--) { // Iterate backwards
// 			dst.children[end1 - 1].remove()
// 		}
// 	// Push extraneous elements:
// 	} else if (start < end2) {
// 		for (; start < end2; start++) {
// 			const clonedElement = src.children[start].cloneNode(true)
// 			dst.insertBefore(clonedElement, dst.children[start])
// 		}
// 	}
// }

// Recursively syncs two elements. Note that event listeners
// are not reattached.
export function syncElements(src, dst) {
	if (syncNodes(src, dst)) {
		// No-op
		return
	}
	// TODO: Add support for syncElements backwards?
	for (let x = 0; x < src.childNodes.length; x++) {
		if (x < dst.childNodes.length) {
			syncElements(src.childNodes[x], dst.childNodes[x])
			continue
		}
		// src has too many nodes:
		const clonedNode = src.childNodes[x].cloneNode(true)
		dst.appendChild(clonedNode)
		// if (!dst.childNodes.length) {
		// 	dst.appendChild(clonedNode)
		// 	continue
		// }
		// dst.insertBefore(clonedNode, dst.childNodes[x - 1])
	}
	for (let x = dst.childNodes.length - 1; x >= src.childNodes.length; x--) {
		// dst has too many nodes; remove backwards:
		dst.childNodes[x].remove()
	}
}
