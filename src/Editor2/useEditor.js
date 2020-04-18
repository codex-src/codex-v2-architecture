import extendPosRange from "./extendPosRange"
import parse from "./parser"
import useMethods from "use-methods"

import {
	newNodes,
	newPos,
} from "./constructors"

// Creates a new editor state.
function newEditor(initialValue) {
	const nodes = newNodes(initialValue)
	const initialState = {
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
	return initialState
}

const methods = state => ({
	// Registers props.
	registerProps(readOnly) {
		state.readOnly = Boolean(readOnly) // Cast because readOnly is a prop
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
	},
	// Input method for onCompositionEnd and onInput.
	input(nodes, atEnd, [pos1, pos2]) {
		// Get the start offset:
		const key1 = nodes[0].id
		const offset1 = state.nodes.findIndex(each => each.id === key1)
		if (offset1 === -1) {
			throw new Error("input: offset1 out of bounds")
		}
		// Get the end offset:
		const key2 = nodes[nodes.length - 1].id
		const offset2 = !atEnd ? state.nodes.findIndex(each => each.id === key2) : state.nodes.length - 1
		if (offset2 === -1) {
			throw new Error("input: offset2 out of bounds")
		}
		// Update nodes and pos and rerender:
		state.nodes.splice(offset1, offset2 - offset1 + 1, ...nodes)
		Object.assign(state, { pos1, pos2 })
		this.render()
	},
	// Rerenders the string and VDOM representations.
	render() {
		Object.assign(state, {
			data: state.nodes.map(each => each.data).join("\n"),
			reactVDOM: parse(state.nodes),
		})
	},
})

function useEditor(initialValue) {
	return useMethods(methods, {}, () => newEditor(initialValue))
}

export default useEditor
