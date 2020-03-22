// // Ascends to the nearest data-block element.
// function ascendToBlockElement(node) {
// 	while (node && node.parentNode) {
// 		node = node.parentNode
// 		if (node && node.getAttribute("data-block") === "true") {
// 			// No-op
// 			break
// 		}
// 	}
// 	return node
// }

// Gets the cursor (a pos object) from a range.
function getPosFromRange(rootNode, node, offset) {
	const pos = {
		// id: "",    // TODO
		// ref: null, // TODO
		x: 0,   // The character index (of the current paragraph)
		y: 0,   // The paragraph index
		pos: 0, // The cursor position
	}
	// NOTE: Gecko/Firefox can select the end element node
	if (node.nodeType === Node.ELEMENT_NODE && offset && !(offset < node.childNodes.length)) {
		node = null
		offset = 0
	}
	const recurse = startNode => {
		const { childNodes } = startNode
		let index = 0
		while (index < childNodes.length) {
			// Ignore data-cursor:
			if (childNodes[index].nodeType === Node.ELEMENT_NODE &&
					(childNodes[index].getAttribute("data-cursor") || childNodes[index].getAttribute("data-measure"))) {
				index++
				continue
			}
			if (childNodes[index] === node) {
				// const ref = ascendToBlockElement(node)
				Object.assign(pos, {
					// id: ref.id,
					// ref,
					x: pos.x + offset,
					pos: pos.pos + offset,
				})
				return true
			}
			const { length } = childNodes[index].nodeValue || ""
			Object.assign(pos, {
				x: pos.x + length,
				pos: pos.pos + length,
			})
			if (recurse(childNodes[index])) {
				return true
			}
			const { nextSibling } = childNodes[index]
			if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE &&
					(/* nextSibling.hasAttribute("data-compound-node") || */ nextSibling.hasAttribute("data-block"))) {
				Object.assign(pos, {
					x: 0, // Reset
					y: pos.y + 1,
					pos: pos.pos + 1,
				})
			}
			index++
		}
		return false
	}
	recurse(rootNode)
	return pos
}

export default getPosFromRange
