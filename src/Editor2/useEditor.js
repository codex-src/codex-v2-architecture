import parse from "./parser"
import useMethods from "use-methods"

import {
	newNodes,
	newPos,
} from "./constructors"

// Prepares a new editor state (for useEditor).
function newEditorState(data) {
	const nodes = newNodes(data)
	const pos1 = newPos()
	const pos2 = newPos()
	const initialState = {
		readOnly: false,                         // Is read-only?
		focused: false,                          // Is focused?
		data,                                    // Data data (string)
		nodes,                                   // Document nodes
		pos1,                                    // Start cursor data structure
		pos2,                                    // End cursor data structure
		// TODO: Rename to extendedNodeIDs?
		extPosRange: ["", ""],                   // Extended node (ID) range
		history: {                               // History object
			correctedPos: false,                   // Corrected pos before first change event?
			stack: [                               // History state stack
				{                                    // ...
					data,                              // ...
					nodes,                             // ...
					pos1: { ...pos1 },                 // ...
					pos2: { ...pos1 },                 // ...
				},                                   // ...
			],                                     // ...
			index: 0,                              // History state stack index
		},                                       // ...
		// resetPos: false,                      // TODO: Did reset the cursors?
		reactVDOM: parse(nodes),                 // React VDOM -- does not use React elements
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

		// // Decrement a copy of pos1.y by 2:
		// let y1 = pos1.y
		// y1 -= 2
		// if (y1 < 0) {
		// 	y1 = 0
		// }
		// // Increment a copy of pos2.y by 2:
		// let y2 = pos2.y
		// y2 += 2
		// if (y2 >= state.nodes.length) {
		// 	y2 = state.nodes.length - 1
		// }

		const y1 = Math.max(pos1.y - 2, 0)
		const y2 = Math.min(pos2.y + 2, state.nodes.length - 1)
		const extPosRange = [state.nodes[y1].id, state.nodes[y2].id]
		Object.assign(state, { pos1, pos2, extPosRange })
	},
	// Writes character data.
	write(data) {
		// Correct pos before first change event:
		if (!state.history.index && !state.history.correctedPos) {
			Object.assign(state.history.stack[0], {
				pos1: state.pos1,
				pos2: state.pos2,
			})
			state.history.correctedPos = true
		}
		this.dropRedos()

		// Parse new nodes:
		const nodes = newNodes(data)
		const node1 = state.nodes[state.pos1.y]
		const node2 = { ...state.nodes[state.pos2.y] } // Create a new reference
		// Concatenate the end of the start node:
		node1.data = node1.data.slice(0, state.pos1.x) + nodes[0].data
		state.nodes.splice(state.pos1.y + 1, state.pos2.y - state.pos1.y, ...nodes.slice(1))
		// Concatenate the start of the end node:
		//
		// NOTE: The end node can be the start node or the end
		// of the new nodes
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
		// Correct pos before first change event:
		if (!state.history.index && !state.history.correctedPos) {
			Object.assign(state.history.stack[0], {
				pos1: state.pos1,
				pos2: state.pos2,
			})
			state.history.correctedPos = true
		}
		this.dropRedos()

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
	// Cuts character data.
	cut() {
		this.write("")
	},
	// Copies character data.
	copy() {
		// No-op
	},
	// Pastes character data.
	//
	// TODO: Add pasteFromHTML handler
	paste(data) {
		this.write(data)
	},
	// Stores the next undo state.
	storeUndo() {
		const undo = state.history.stack[state.history.index]
		if (undo.data.length === state.data.length && undo.data === state.data) {
			// No-op
			return
		}
		const { data, nodes, pos1, pos2 } = state
		// NOTE: Copy pos1 and pos2 because of correctedPos
		state.history.stack.push({ data, nodes, pos1: { ...pos1 }, pos2: { ...pos2 } })
		state.history.index++
	},
	// Drops redo states.
	dropRedos() {
		state.history.stack.splice(state.history.index + 1)
	},
	// Undos once:
	undo() {
		// Reset correctedPos before committing the first or
		// second-to-first undo:
		if (state.history.index <= 1 && state.history.correctedPos) {
			state.history.correctedPos = false
		}

		// Guard bounds error:
		if (state.history.index) {
			state.history.index--
		}
		const undo = state.history.stack[state.history.index]
		Object.assign(state, undo)
		// TOOD: render does not need to compute state.data
		this.render()
	},
	// Redos once:
	redo() {
		// Guard bounds error:
		if (state.history.index + 1 === state.history.stack.length) {
			// No-op
			return
		}
		state.history.index++
		const redo = state.history.stack[state.history.index]
		Object.assign(state, redo)
		// TOOD: render does not need to compute state.data
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
	return useMethods(methods, {}, () => newEditorState(initialValue))
}

export default useEditor
