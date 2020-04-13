import * as Types from "./__types"
import React from "react"
import uuidv4 from "uuid/v4"
import { newPos } from "./constructors"

function useEditor(initialValue: string): Types.EditorSetState {
	const data = initialValue.split("\n").map(each => ({
		id: uuidv4(),
		raw: each,
	}))
	const [state, setState] = React.useState(() => ({
		readOnly: false,
		focused: false,
		data,
		pos1: newPos(),
		pos2: newPos(),
		extPosRange: ["", ""],
		reactDOM: document.createElement("div"),
	}))
	return [state, setState]
}

export default useEditor
