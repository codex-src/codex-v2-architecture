import newPos from "./newPos"
import parse from "./parser"
import React from "react"
import typeEnum from "./typeEnum"
import uuidv4 from "uuid/v4"

// TODO: Refactor options to <Editor> props?
function useEditor(initialValue, options = null) {
	const unparsed = initialValue.split("\n").map(each => ({
		id: uuidv4(),
		raw: each,
	}))
	const reactDOM = document.createElement("div")
	const [state, setState] = React.useState(() => ({
		readOnly: false,       // Is read-only?
		focused: false,        // Is focused?
		// Depreacte selected?
		selected: false,       // Has a selection?
		data: parse(unparsed), // Document data
		pos1: newPos(),        // Start cursor
		pos2: newPos(),        // End cursor
		reactDOM,              // The React-managed DOM
	}))
	return [state, setState]
}

export default useEditor
