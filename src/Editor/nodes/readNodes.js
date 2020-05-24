import { isDocumentNode } from "./documentNodes"

// Reads a data-codex-node or data-codex-root element.
export function readNode(node) {
	let data = ""
	const recurse = on => {
		if (on.nodeType === Node.TEXT_NODE) {
			data += on.nodeValue
			return
		}
		for (const each of on.childNodes) {
			recurse(each)
			const next = each.nextElementSibling
			if (next && isDocumentNode(next)) {
				data += "\n"
			}
		}
	}
	recurse(node)
	return data
}

// Reads the current data-codex-node or data-codex-root
// element.
export function readCurrentNode(editorState) {
	const { id } = editorState.nodes[editorState.pos1.y]
	const node = document.getElementById(id)
	if (!node) {
		throw new Error(`readCurrentNode: could not query id=${id || "(empty)"}`)
	}
	return readNode(node)
}

export default readCurrentNode
