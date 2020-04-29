import uuidv4 from "uuid/v4"
import { ascendRoot } from "./ascendNodes"

// Queries data-codex-root elements.
//
// NOTE: atEnd records whether the end node (root) changed
// because of an enter or backspace event
function queryRoots(editorRoot, [extPos1ID, extPos2ID]) {
	const node1 = ascendRoot(document.getElementById(extPos1ID))
	if (!node1 || !editorRoot.contains(node1)) {
		throw new Error("queryRoots: no such node1 or out of bounds")
	}
	let node2 = ascendRoot(document.getElementById(extPos2ID))
	let node2AtEnd = false
	// Guard enter pressed on node2:
	const next = node2 && node2.nextElementSibling
	if (next && next.getAttribute("data-codex-root") && (!next.id || next.id === node2.id)) {
		next.id = uuidv4() // Correct the ID
		node2 = next
		node2AtEnd = true
	// Guard backspace or forward-backspace pressed on node2:
	} else if (!node2) {
		node2 = editorRoot.children[editorRoot.children.length - 1]
		node2AtEnd = true
	}
	if (!node2 || !editorRoot.contains(node2)) {
		throw new Error("queryRoots: no such node2 or out of bounds")
	}
	return { roots: [node1, node2], atEnd: node2AtEnd }
}

export default queryRoots
