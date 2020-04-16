import uuidv4 from "uuid/v4"

// Queries data-codex-root elements.
function queryRoots(editorRoot, extendedPosRange) {
	const root1 = document.getElementById(extendedPosRange[0])
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error("queryRoots: no such root1 or out of bounds")
	}
	let root2 = document.getElementById(extendedPosRange[1])
	let root2AtEnd = false
	// Guard enter pressed on root2:
	const nextRoot = root2 && root2.nextElementSibling
	if (nextRoot && nextRoot.getAttribute("data-codex-root") && (!nextRoot.id || nextRoot.id === root2.id)) {
		nextRoot.id = uuidv4() // Correct the ID
		root2 = nextRoot
		root2AtEnd = true
	// Guard backspaced pressed on root2:
	} else if (!root2) {
		root2 = editorRoot.children[editorRoot.children.length - 1]
		root2AtEnd = true
	}
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error("queryRoots: no such root2 or out of bounds")
	}
	return { roots: [root1, root2], root2AtEnd }
}

export default queryRoots
