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
	},
	// Input method for onCompositionEnd and onInput.
	input(nodes, atEnd, [pos1, pos2]) {

		const k1 = nodes[0].id
		const k2 = nodes[nodes.length - 1].id

		const x1 = state.nodes.findIndex(each => each.id === k1)
		if (x1 === -1) {
			throw new Error("input: x1 out of bounds")
		}
		const x2 = !atEnd ? state.nodes.findIndex(each => each.id === k2) : state.nodes.length - 1
		if (x2 === -1) {
			throw new Error("input: x2 out of bounds")
		}

		state.nodes.splice(x1, x2 - x1 + 1, ...nodes)
		Object.assign(state, { pos1, pos2 })

		this.render()

		// Object.assign(state, { data, pos1, pos2 })

		// console.log(newNodes)

		// const nodes = state.nodes.splice(index1, (index2 + 1) - index1, ...nodes)
		// console.log(x1, x2)

		// // Create a new action:
		// this.registerAction(ActionTypes.INPUT)
		// if (!state.history.index && !state.resetPos) {
		// 	Object.assign(state.history.stack[0], {
		// 		pos1: state.pos1,
		// 		pos2: state.pos2,
		// 	})
		// 	state.resetPos = true
		// }
		// this.dropRedos()
		// // Update body:
		// const key1 = nodes[0].key
		// const index1 = state.body.findIndex(each => each.key === key1)
		// if (index1 === -1) {
		// 	throw new Error("FIXME")
		// }
		// const key2 = nodes[nodes.length - 1].key
		// const index2 = !atEnd ? state.body.findIndex(each => each.key === key2) : state.body.length - 1
		// if (index2 === -1) {
		// 	throw new Error("FIXME")
		// }
		// state.body.splice(index1, (index2 + 1) - index1, ...nodes)
		// // Update data, pos1, and pos2:
		// const data = state.body.map(each => each.data).join("\n")
		// Object.assign(state, { data, pos1, pos2 })
		// this.render()

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
