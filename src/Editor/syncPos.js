// import computePosRange from "./computePosRange"
import { newRange } from "./constructors"

// Computes a range data structure based on the DOM.
function computeDOMRange(editorRoot, { pos }) {
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
	recurse(editorRoot)
	// COMPAT: FF does not step over <div class="hidden">
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
	const isFF = navigator.userAgent.indexOf("Firefox") !== -1
	if (isFF && range.node.nodeType === Node.TEXT_NODE && range.node.parentElement.classList.contains("hidden")) {
		range.node = range.node.parentElement.parentElement
		range.offset = range.node.children.length - 1
	}
	return range
}

// Computes a range data structure based on pos.pos.
//
// TODO: Can we use document.getElementByID and computeRange
// off of the data-codex-node or data-codex-root element?
function computeRange(editorState, editorRoot, { pos }) {
	const { nodes } = editorState

	// NOTE: pos.x and pos.y are out of sync because of
	// dispatch.write; use pos.pos e.g. { pos }
	let p = pos // TODO: Use pos instead

	let id = ""
	for (let x = 0; x < nodes.length; x++) {
		if (p - nodes[x].data.length <= 0) {
			id = nodes[x].id
			break
		}
		p -= nodes[x].data.length
		if (x + 1 < nodes.length) {
			p--
		}
	}
	// console.log(p, id, document.getElementById(id))
	console.log(
		computeDOMRange(document.getElementById(id), { pos: p }),
		computeDOMRange(editorRoot, { pos }),
	)
	return computeDOMRange(editorRoot, { pos })
}

// Synchronizes cursors.
function syncPos(editorState, editorRoot, [pos1, pos2]) {
	const selection = document.getSelection()
	// https://github.com/codex-src/codex-v2-architecture/commit/a295f2fe862b1cbe8bdaa7bc0cf4edb200cbd2ac
	// if (!selection.rangeCount) {
	// 	// No-op; defer to end
	// } else {
	// 	const [domPos1, domPos2] = computePosRange(editorRoot) // FIXME: If uncommented, computePosRange expects editorState
	// 	if (domPos1.pos === pos1.pos && domPos2.pos === pos2.pos) {
	// 		return false
	// 	}
	// }
	const r1 = computeRange(editorState, editorRoot, pos1)
	let r2 = { ...r1 }
	if (pos2.pos !== pos1.pos) {
		r2 = computeRange(editorState, editorRoot, pos2)
	}
	// Guard bounds:
	if (!r1.node || !r2.node) {
		return false
	}
	const range = document.createRange()
	range.setStart(r1.node, r1.offset)
	range.setEnd(r2.node, r2.offset)
	selection.removeAllRanges()
	selection.addRange(range)
	return true
}

export default syncPos
