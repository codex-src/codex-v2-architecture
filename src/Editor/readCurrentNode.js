// Reads the current data-codex-node element.
function readCurrentNode(editorState) {
	const { id } = editorState.nodes[editorState.pos1.y]
	const node = document.getElementById(id)
	if (!node) {
		throw new Error(`readCurrentNode: could not query id=${id || "(empty)"}`)
	}
	let data = ""
	const recurse = on => {
		if (on.nodeType === Node.TEXT_NODE) {
			data += on.nodeValue
			return
		}
		for (const each of on.childNodes) {
			recurse(each)
		}
	}
	recurse(node)
	return data
}

export default readCurrentNode
