import { newNodes } from "./constructors"

// Reads a data-codex-root element.
function readRoot(rootElement) {
	const nodes = newNodes("")
	nodes[0].id = rootElement.id
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
	recurse(rootElement)
	return nodes
}

// Reads a range of data-codex-root elements.
function readRoots(editorRoot, [rootElement1, rootElement2]) {
	const nodes = []
	while (rootElement1) {
		nodes.push(...readRoot(rootElement1))
		if (rootElement1 === rootElement2) {
			// No-op
			break
		}
		rootElement1 = rootElement1.nextElementSibling
	}
	// const deduped = dedupeNodes(nodes)
	// return deduped
	return nodes
}

export default readRoots
