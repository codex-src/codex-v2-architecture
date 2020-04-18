import uuidv4 from "uuid/v4"

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
			if (next && next.getAttribute("data-codex-node")) {
				nodes.push({ id: next.id, data: "" })
			}
		}
	}
	recurse(root)
	return nodes
}

// Reads a range of data-codex-root elements.
function readRoots(editorRoot, [root1, root2]) {
	// TODO: Reuse dedupeNodes?
	const nodes = []
	const seen = {}
	while (root1) {
		// Guard repeat IDs:
		if (!root1.id || seen[root1.id]) {
			root1.id = uuidv4()
		}
		seen[root1.id] = true
		nodes.push(...readRoot(root1))
		if (root1 === root2) {
			// No-op
			break
		}
		root1 = root1.nextElementSibling
	}
	return nodes
}

export default readRoots
