import uuidv4 from "uuid/v4"
import { ascendRoot } from "./ascendNodes"

// Queries data-codex-root elements.
function queryRoots(editorRoot, [extPos1ID, extPos2ID]) {
	const root1 = ascendRoot(document.getElementById(extPos1ID))
	if (!root1 || !editorRoot.contains(root1)) {
		throw new Error("queryRoots: no such root1 or out of bounds")
	}
	const root2 = ascendRoot(document.getElementById(extPos2ID))
	if (!root2 || !editorRoot.contains(root2)) {
		throw new Error("queryRoots: no such root2 or out of bounds")
	}
	return [root1, root2]
}

export default queryRoots
