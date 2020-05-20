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
			if (recurse(each)) {
				return true
			}
			pos -= (each.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-codex-node") || next.getAttribute("data-codex-root"))) {
				pos--
			}
		}
		return false
	}
	recurse(root)
	// COMPAT: Firefox does not step over <div class="hidden">
	//
	// <ul data-codex-root>
	//   <li data-codex-node> <- to { node, offset: 2 }
	//     <div class="hidden">
	//       ... <- from { node, offset: 0 }
	//     </div>
	//     <br>
	//   </li>
	// </ul>
	//
	const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1
	if (isFirefox && range.node.nodeType === Node.TEXT_NODE && range.node.parentElement.classList.contains("hidden")) {
		range.node = range.node.parentElement.parentElement
		range.offset = range.node.children.length - 1
	}
	return range
}

// Computes a meta DOM cursor; uses VDOM and DOM to compute.
function computeMetaRange(editorState, pos) {
	let nodeID = ""
	for (const each of editorState.nodes) {
		if (pos - each.data.length <= 0) {
			nodeID = each.id
			break
		}
		pos -= (each.data + "\n").length
	}
	// NOTE: nodeID can resolve to a data-codex-node or
	// data-codex-root element
	const node = document.getElementById(nodeID)
	if (!nodeID || !node) {
		throw new Error(`computeMetaRange: could not query node (id=${nodeID || "\"\""}`)
	}
	return computeDOMRange(node, pos)
}

// Synchronizes DOM cursors.
function syncPos(editorState, [pos1, pos2]) {
	const selection = document.getSelection()
	if (!selection || selection.rangeCount) {
		throw new Error("syncPos: selection exists when it should not")
	}
	const range1 = computeMetaRange(editorState, pos1.pos)
	let range2 = { ...range1 }
	if (!editorState.collapsed) {
		range2 = computeMetaRange(editorState, pos2.pos)
	}
	const range = document.createRange()
	range.setStart(range1.node, range1.offset)
	range.setEnd(range2.node, range2.offset)
	selection.addRange(range)
}

export default syncPos
