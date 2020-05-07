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

// Recursively syncs two elements. Note that event listeners
// are not reattached.
export function syncElements(src, dst) {
	if (syncNodes(src, dst)) {
		// No-op
		return
	}
	// Iterate forwards:
	let x = 0
	const min = Math.min(src.childNodes.length, dst.childNodes.length)
	for (; x < min; x++) {
		if (!dst.childNodes[x].isEqualNode(src.childNodes[x])) { // FIXME
			syncElements(src.childNodes[x], dst.childNodes[x])
			x++ // Eagerly increment (because of break)
			break
		}
	}
	// Iterate backwards (after syncElements):
	let srcEnd = src.childNodes.length
	let dstEnd = dst.childNodes.length
	for (; srcEnd > x && dstEnd > x; srcEnd--, dstEnd--) {
		if (!dst.childNodes[dstEnd - 1].isEqualNode(src.childNodes[srcEnd - 1])) { // FIXME
			syncElements(src.childNodes[srcEnd - 1], dst.childNodes[dstEnd - 1])
		}
	}
	// Append extraneous nodes:
	if (x < srcEnd) {
		for (; x < srcEnd; x++) {
			const clonedNode = src.childNodes[x].cloneNode(true)
			dst.insertBefore(clonedNode, dst.childNodes[x])
		}
	// Remove extraneous nodes:
	} else if (x < dstEnd) {
		for (; x < dstEnd; dstEnd--) { // Iterate backwards
			dst.childNodes[dstEnd - 1].remove()
		}
	}

	// // TODO: Add support for syncElements backwards?
	// for (let x = 0; x < src.childNodes.length; x++) {
	// 	if (x < dst.childNodes.length) {
	// 		syncElements(src.childNodes[x], dst.childNodes[x])
	// 		continue
	// 	}
	// 	// src has too many nodes:
	// 	const clonedNode = src.childNodes[x].cloneNode(true)
	// 	dst.appendChild(clonedNode)
	// 	// if (!dst.childNodes.length) {
	// 	// 	dst.appendChild(clonedNode)
	// 	// 	continue
	// 	// }
	// 	// dst.insertBefore(clonedNode, dst.childNodes[x - 1])
	// }
	// for (let x = dst.childNodes.length - 1; x >= src.childNodes.length; x--) {
	// 	// dst has too many nodes; remove backwards:
	// 	dst.childNodes[x].remove()
	// }
}
