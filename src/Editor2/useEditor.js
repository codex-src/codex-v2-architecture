import parse from "./parser"
import React from "react"
import useMethods from "use-methods"
import uuidv4 from "uuid/v4"

import {
	newNodes,
	newPos,
} from "./constructors"

function initialState(initialValue) {
	const nodes = newNodes(initialValue)
	const state = {
		readOnly: false,                         // Is read-only?
		focused: false,                          // Is focused?
		data: initialValue,                      // Data (string)
		nodes,                                   // Document nodes
		pos1: newPos(),                          // Start cursor data structure
		pos2: newPos(),                          // End cursor data structure
		extendedPosRange: ["", ""],              // Extended node (ID) range
		parsed: parse(nodes),                    // Parsed document nodes
		reactDOM: document.createElement("div"), // React-managed DOM
	}
	return state
}

function methods(state) {
	const dispatch = {
		// Registers props.
		registerProps(readOnly) {
			state.readOnly = readOnly
		},
		// Focuses the editor.
		focus() {
			state.focused = true
		},
		// Blurs the editor.
		blur() {
			state.focused = false
		},
	}
	return dispatch
}

function useEditor(initialValue) {
	return useMethods(methods, initialState, () => initialState(initialValue))
}

export default useEditor
