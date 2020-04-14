import * as Types from "./__types"
import uuidv4 from "uuid/v4"

// Reads a data-root element.
function readRoot(root: HTMLElement) {
	const unparsed = [
		{
			id: root.id,
			raw: "",
		},
	]
	const recurse = (on: Node) => {
		if (on.nodeType === Node.TEXT_NODE) {
			unparsed[unparsed.length - 1].raw += on.nodeValue
			return
		}
		for (const each of on.childNodes) {
			recurse(each)
			const next = (each as HTMLElement).nextElementSibling
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

type SeenMap = { [key: string]: boolean }

// Reads a range of data-root elements.
function readRoots(editorRoot: HTMLElement, [r1, r2]: HTMLElement[]) {
	const unparsed: Types.UnparsedElement[] = []
	const seen: SeenMap = {}
	// NOTE: Use null | HTMLElement for while condition
	let root: null | HTMLElement = r1
	while (root) {
		// Guard repeat IDs:
		if (!root.id || seen[root.id]) {
			root.id = uuidv4()
		}
		seen[root.id] = true
		unparsed.push(...readRoot(root))
		if (root === r2) {
			// No-op
			break
		}
		root = root.nextElementSibling as HTMLElement
	}
	return unparsed
}

export default readRoots
