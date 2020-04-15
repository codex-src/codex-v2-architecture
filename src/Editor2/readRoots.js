import uuidv4 from "uuid/v4"

// Reads a data-root element.
function readRoot(root) {
	const unparsed = [
		{
			id: root.id,
			raw: "",
		},
	]
	const recurse = on => {
		if (on.nodeType === Node.TEXT_NODE) {
			unparsed[unparsed.length - 1].raw += on.nodeValue
			return
		}
		for (const each of on.childNodes) {
			recurse(each)
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				unparsed.push({
					id: next.id,
					raw: "",
				})
			}
		}
	}
	recurse(root)
	return unparsed
}

// Reads a range of data-root elements.
function readRoots(editorRoot, [startRoot, endRoot]) {
	const unparsed = []
	const seen = {}
	while (startRoot) {
		// Guard repeat IDs:
		if (!startRoot.id || seen[startRoot.id]) {
			startRoot.id = uuidv4()
		}
		seen[startRoot.id] = true
		unparsed.push(...readRoot(startRoot))
		if (startRoot === endRoot) {
			// No-op
			break
		}
		startRoot = startRoot.nextElementSibling
	}
	return unparsed
}

export default readRoots
