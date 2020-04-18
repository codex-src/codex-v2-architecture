import parse from "./parser"
import useMethods from "use-methods"

import {
	newNodes,
	newPos,
} from "./constructors"

// Prepares a new editor state (for useEditor).
function newEditorState(initialValue) {
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
	//
	// NOTE: Can use Math.max and Math.min instead
	select(pos1, pos2) {
		// Decrement a copy of pos1.y 2x:
		let y1 = pos1.y
		y1 -= 2
		if (y1 < 0) {
			y1 = 0
		}
		// Increment a copy of pos2.y 2x:
		let y2 = pos2.y
		y2 += 2
		if (y2 >= state.nodes.length) {
			y2 = state.nodes.length - 1
		}
		const extendedPosRange = [state.nodes[y1].id, state.nodes[y2].id]
		Object.assign(state, { pos1, pos2, extendedPosRange })
	},
	// Writes character data.
	//
	// NOTE: write is inverse to input; write writes character
	// data whereas input splices nodes (read from the DOM)
	write(data) {
		// Parse new nodes:
		const nodes = newNodes(data)
		const node1 = state.nodes[state.pos1.y]
		const node2 = { ...state.nodes[state.pos2.y] } // Create a new reference
		// Concatenate the start node:
		node1.data = node1.data.slice(0, state.pos1.x) + nodes[0].data
		state.nodes.splice(state.pos1.y + 1, state.pos2.y - state.pos1.y, ...nodes.slice(1))
		// Concatenate the end node:
		let node = node1
		if (nodes.length > 1) {
			node = nodes[nodes.length - 1]
		}
		node.data += node2.data.slice(state.pos2.x)
		// Update and rerender:
		const pos1 = { ...state.pos1, pos: state.pos1.pos + data.length }
		const pos2 = { ...pos1 }
		Object.assign(state, { pos1, pos2 })
		this.render()
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
		// Update and rerender:
		state.nodes.splice(offset1, offset2 - offset1 + 1, ...nodes)
		Object.assign(state, { pos1, pos2 })
		this.render()
	},
	// Inserts a tab character.
	tab() {
		this.write("\t")
	},
	// Inserts an EOL character.
	enter() {
		this.write("\n")
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
	return useMethods(methods, {}, () => newEditorState(initialValue))
}

export default useEditor
