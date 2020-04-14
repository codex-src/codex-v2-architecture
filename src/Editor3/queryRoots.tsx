import uuidv4 from "uuid/v4"

// Queries data-root elements.
function queryRoots(editorRoot: HTMLElement, extPosRange: string[]) {
	const root1 = document.getElementById(extPosRange[0])
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error("queryRoots: no such root1 or out of bounds")
	}
	let root2 = document.getElementById(extPosRange[1])
	let root2AtEnd = false
	// Guard enter pressed on root2:
	const next = root2 && root2.nextElementSibling as HTMLElement
	if (next && next.getAttribute("data-root") && (!next.id || next.id === root2!.id)) {
		next.id = uuidv4() // Correct the ID
		root2 = next
		root2AtEnd = true
	// Guard backspaced pressed on root2:
	} else if (!root2) {
		root2 = editorRoot.children[editorRoot.children.length - 1] as HTMLElement
		root2AtEnd = true
	}
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error("queryRoots: no such root2 or out of bounds")
	}
	return { roots: [root1, root2], root2AtEnd }
}

export default queryRoots
