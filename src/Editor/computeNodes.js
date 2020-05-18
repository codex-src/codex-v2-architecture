import { ascendRoot } from "./ascendNodes"
import { newNodes } from "./constructors"

// Reads a data-codex-root element.
function readRoot(root) {
	const nodes = newNodes("")
	nodes[0].id = root.id
	const recurse = on => {
		if (on.nodeType === Node.TEXT_NODE) {
			// Concatenate the end node:
			nodes[nodes.length - 1].data += on.nodeValue
			return
		}
		for (const each of on.childNodes) {
			recurse(each)
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-codex-node") || next.getAttribute("data-codex-root"))) {
				// Push a new node:
				nodes.push({
					id: next.id,
					data: "",
				})
			}
		}
	}
	recurse(root)
	return nodes
}

// Computes nodes from an extended node (root ID) range.
function computeNodes(editorRoot, extPosRange) {
	// Query data-codex-root elements:
	const root1 = ascendRoot(document.getElementById(extPosRange[0]))
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error("computeNodes: no such root1 or out of bounds")
	}
	const root2 = ascendRoot(document.getElementById(extPosRange[1]))
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error("computeNodes: no such root2 or out of bounds")
	}
	// Read nodes from data-codex-root elements:
	const nodes = []
	let currentRoot = root1
	while (currentRoot) {
		nodes.push(...readRoot(currentRoot))
		if (currentRoot === root2) {
			// No-op
			break
		}
		currentRoot = currentRoot.nextElementSibling
	}
	return nodes
}

export default computeNodes
