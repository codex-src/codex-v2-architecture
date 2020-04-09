import newPos from "./newPos"
import parseGFM from "./parseGFM"
import React from "react"
import typeEnum from "./typeEnum"
import uuidv4 from "uuid/v4"

// TODO: Refactor options to <Editor> props?
function useEditor(initialValue, options = null) {
	const [state, setState] = React.useState(() => ({
		readOnly: false, // Is the editor read-only?
		focused: false,  // Is the editor focused?
		selected: false, // Does the editor have a selection?
		data: parseGFM(initialValue.split("\n").map(each => ({
			id: uuidv4(),
			raw: each,
		}))),
		pos1: newPos(),
		pos2: newPos(),
	}))
	return [state, setState]
}

export default useEditor
