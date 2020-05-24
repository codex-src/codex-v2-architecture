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
function computeMetaRange(editorState, pos) {
	let id = ""
	for (const each of editorState.nodes) { // FIXME
		if (pos - each.data.length <= 0) {
			id = each.id
			break
		}
		pos -= (each.data + "\n").length // FIXME
	}
	const node = document.getElementById(id)
	if (!id || !node) {
		throw new Error(`computeMetaRange: could not query node (id=${id || "\"\""})`)
	}
	return computeDOMRange(node, pos)
}

// Synchronizes DOM cursors.
function syncPos(editorState) {
	let t = Date.now()

	const selection = document.getSelection()
	// if (!selection || selection.rangeCount) {
	// 	throw new Error("syncPos: selection exists when it should not")
	// }

	console.log("b", Date.now() - t)
	t = Date.now()

	const range1 = computeMetaRange(editorState, editorState.pos1.pos)

	console.log("c", Date.now() - t)
	t = Date.now()

	let range2 = { ...range1 }
	if (!editorState.collapsed) {
		range2 = computeMetaRange(editorState, editorState.pos2.pos)

		console.log("d", Date.now() - t)
		t = Date.now()

	}

	console.log("e", Date.now() - t)
	t = Date.now()

	const range = document.createRange()
	range.setStart(range1.node, range1.offset)

	console.log("f", Date.now() - t)
	t = Date.now()

	range.setEnd(range2.node, range2.offset)


	console.log("g", Date.now() - t)
	t = Date.now()

	// selection.removeAllRanges()
	selection.addRange(range)

	console.log("h", Date.now() - t)
	t = Date.now()
}

export default syncPos
