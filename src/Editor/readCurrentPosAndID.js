import readCurrentPos from "./readCurrentPos"
import { ascendToElement } from "./documentNodes/ascend"

// Reads the current cursor data structures and root
// document ID.
function readCurrentPosAndID(editorState) {
	const pos = readCurrentPos(editorState)

	let id = ""
	const selection = document.getSelection()
	if (selection.rangeCount) {
		const range = selection.getRangeAt(0)
		const root = ascendToElement(range.startContainer).closest("[data-codex-editor] > *")
		id = root.id || root.querySelector("[id]").id
	}

	return { pos, id }
}

export default readCurrentPosAndID
