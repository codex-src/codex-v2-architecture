import { isDocumentNode } from "./test"

// Reads a document node; mocks element.innerHTML.
export function readDocumentNode(node) {
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

// Reads the current document node.
export function readCurrentDocumentNode(editorState) {
	const { id } = editorState.nodes[editorState.pos1.y]
	const node = document.getElementById(id)
	if (!node) {
		throw new Error(`readCurrentDocumentNode: could not query id=${id || "(empty)"}`)
	}
	return readDocumentNode(node)
}

export default readCurrentDocumentNode
