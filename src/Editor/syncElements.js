// Replaces attributes (on element dst). Non-overlapping
// attributes are removed.
export function replaceAttributes(src, dst) {
	const attrKeys = new Set()
	for (const attr of [...src.attributes]) {
		attrKeys.add(attr.nodeName)
	}
	for (const attr of [...dst.attributes]) {
		attrKeys.add(attr.nodeName)
	}
	for (const key of attrKeys) {
		const value = src.getAttribute(key)
		if (value === null || value === dst.getAttribute(key)) {
			if (value === null) {
				dst.removeAttribute(key)
			}
			// No-op
			continue
		}
		dst.setAttribute(key, value)
	}
}

// // Syncs two nodes; non-recursive.
// export function syncNodes(src, dst) {
// 	// Nodes are the same; do nothing:
// 	if (isEqualNode(src, dst)) {
// 		return true
// 	}
// 	// Text handling:
// 	if (src.nodeType === Node.TEXT_NODE && src.nodeType === dst.nodeType) {
// 		dst.nodeValue = src.nodeValue
// 		return true
// 	// Element handling (elements must be of the same type):
// 	} else if (src.nodeType === Node.ELEMENT_NODE && src.nodeType === dst.nodeType && src.nodeName === dst.nodeName) {
// 		replaceAttributes(src, dst)
// 		return false
// 	}
// 	// Text-to-element and element-to-text handling:
// 	const clonedElement = src.cloneNode(true)
// 	dst.replaceWith(clonedElement)
// 	return true
// }
//
// // src:
// // <div>
// // 	<a />
// // 	<div>
// // 		<b />
// // 	</div>
// // </div>
// //
// // dst:
// // <div>
// // 	<div>
// // 		<b />
// // 	</div>
// // 	<a />
// // </div>
//
//
// // Recursively syncs two elements. Note that event listeners
// // are not attached.
// export function syncElements(src, dst) {
// 	if (syncNodes(src, dst)) {
// 		// No-op
// 		return
// 	}
// 	let x = 0
// 	for (; x < src.childNodes.length; x++) {
// 		if (x < dst.childNodes.length) {
// 			syncElements(src.childNodes[x], dst.childNodes[x])
// 		}
// 		// src has too many elements:
// 		const clonedElement = src.childNodes[x].cloneNode(true)
// 		dst.insertBefore(clonedElement, dst.children[x - 1])
// 	}
// 	for (; x < dst.childNodes.length; x++) {
// 		// dst has too many elements:
// 		dst.childNodes[x].remove()
// 	}
// }
