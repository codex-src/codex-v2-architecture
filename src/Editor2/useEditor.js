import extendPosRange from "./extendPosRange"
import parse from "./parser"
import useMethods from "use-methods"

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
		reactVDOM: parse(nodes),                 // React VDOM
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
		// Toggles read-only mode.
		toggleReadOnly() {
			state.readOnly = !state.readOnly
		},
		// Focuses the editor.
		focus() {
			state.focused = true
		},
		// Blurs the editor.
		blur() {
			state.focused = false
		},
		// Selects the editor.
		select(pos1, pos2) {
			const extendedPosRange = extendPosRange(state, [pos1, pos2])
			Object.assign(state, { pos1, pos2, extendedPosRange })
		}
	}
	return dispatch
}

function useEditor(initialValue) {
	return useMethods(methods, initialState, () => initialState(initialValue))
}

export default useEditor
