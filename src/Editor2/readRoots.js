import dedupeNodes from "./dedupeNodes"

// Reads a data-codex-root element.
function readRoot(root) {
	const nodes = [{ id: root.id, data: "" }]
	const recurse = on => {
		if (on.nodeType === Node.TEXT_NODE) {
			nodes[nodes.length - 1].data += on.nodeValue
			return
		}
		for (const each of on.childNodes) {
			recurse(each)
			const next = each.nextElementSibling
			if (next && (next.getAttribute("data-codex-node") || next.getAttribute("data-codex-root"))) {
				nodes.push({ id: next.id, data: "" })
			}
		}
	}
	recurse(root)
	return nodes
}

// Reads a range of data-codex-root elements.
//
// NOTE: readRoots depends on queryRoots
function readRoots(editorRoot, [root1, root2]) {
	const nodes = []
	while (root1) {
		nodes.push(...readRoot(root1))
		if (root1 === root2) {
			// No-op
			break
		}
		root1 = root1.nextElementSibling
	}
	const deduped = dedupeNodes(nodes)
	return deduped
}

export default readRoots
