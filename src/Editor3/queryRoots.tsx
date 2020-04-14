// Queries data-root elements.
function queryRoots(editorRoot: HTMLElement, extPosRange: string[]) {
	// const r1 = document.getElementById(extPosRange[0])
	// if (!r1 || !editorRoot.contains(r1)) {
	// 	throw new Error("queryRoots: no such r1 or out of bounds")
	// }
	// let r2 = document.getElementById(extPosRange[1])
	// let atEnd = false
	// // Guard enter pressed on r2:
	// const nextRoot = r2 && r2.nextElementSibling
	// if (nextRoot && nextRoot.getAttribute("data-root") && (!nextRoot.id || nextRoot.id === r2.id)) {
	// 	nextRoot.id = uuidv4() // Correct the ID
	// 	r2 = nextRoot
	// 	atEnd = true
	// // Guard backspaced pressed on r2:
	// } else if (!r2) {
	// 	r2 = editorRoot.children[editorRoot.children.length - 1]
	// 	atEnd = true
	// }
	// if (!r2 || !editorRoot.contains(r2)) {
	// 	throw new Error("queryRoots: no such r2 or out of bounds")
	// }
	// return { roots: [r1, r2], atEnd }
}

// TODO: Use HTMLElement instead of HTMLDivElement?

export default queryRoots
