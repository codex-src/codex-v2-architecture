import * as Types from "./__types"
import parse from "./parser"
import React from "react"
import uuidv4 from "uuid/v4"
import { newPos } from "./constructors"

// Returns an EditorStateState initializer.
//
// NOTE: Use Types.EditorSetState or expect errors
function useEditor(initialValue: string): Types.EditorSetState {
	const unparsed = initialValue.split("\n").map(each => ({
		id: uuidv4(),
		raw: each,
	}))
	const [state, setState] = React.useState(() => ({
		readOnly: false,
		focused: false,
		data: parse(unparsed),
		pos1: newPos(),
		pos2: newPos(),
		extPosRange: ["", ""],
		reactDOM: document.createElement("div"),
	}))
	return [state, setState]
}

export default useEditor
