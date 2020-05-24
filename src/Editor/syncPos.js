import * as documentNodes from "./documentNodes"
import { newRange } from "./constructors"

// Computes a range data structure based on the DOM.
function computeDOMRange(root, pos) {
	const range = newRange()
	const recurse = on => {
		if (pos - (on.nodeValue || "").length <= 0) {
			Object.assign(range, {
				node: on,
				offset: pos,
			})
			return true
		}
		for (const each of on.childNodes) {
			if (each.nodeType === Node.ELEMENT_NODE && each.classList.contains("absolute")) {
				// No-op; defer to end
			} else if (each.nodeType === Node.ELEMENT_NODE && each.classList.contains("hidden")) {
				pos -= each.innerHTML.length // FIXME
			} else if (recurse(each)) {
				return true
			}
			pos -= (each.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && documentNodes.isNode(next)) {
				pos--
			}
		}
		return false
	}
	recurse(root)

	// FIXME
	if (range.node.nodeType === Node.ELEMENT_NODE && range.node.nodeName === "BR") {
		// const br = range.node
		range.node = range.node.parentElement
		// range.offset = [...range.node.childNodes].indexOf(each => each === br) // FIXME
		range.offset = [...range.node.childNodes].length - 1
	}

	return range
}

// Computes a meta DOM cursor; uses VDOM and DOM to compute.
function computeMetaRange(nodes, pos) {
	// console.log({ nodes, pos })

	let id = ""
	for (const each of nodes) { // FIXME
		if (pos - each.data.length <= 0) {
			id = each.id
			break
		}
		pos -= (each.data + "\n").length // FIXME
	}

	// console.log({ id })

	const node = document.getElementById(id)
	if (!node) {
		throw new Error(`computeMetaRange: could not query id=${id || "(empty)"}`)
	}
	return computeDOMRange(node, pos)
}

// Synchronizes DOM cursors.
function syncPos(editorState) {
	const selection = document.getSelection()
	if (!selection || selection.rangeCount) {
		throw new Error("syncPos: selection exists when it should not")
	}
	const range1 = computeMetaRange(editorState.nodes, editorState.pos1.pos)
	let range2 = { ...range1 }
	if (!editorState.collapsed) {
		range2 = computeMetaRange(editorState.nodes, editorState.pos2.pos)
	}
	const range = document.createRange()
	range.setStart(range1.node, range1.offset)
	range.setEnd(range2.node, range2.offset)
	// selection.removeAllRanges()
	selection.addRange(range)
}

export default syncPos
