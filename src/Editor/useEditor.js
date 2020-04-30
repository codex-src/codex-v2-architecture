import * as emojiTrie from "emoji-trie"
import * as utf8 from "encoding/utf8"
import useMethods from "use-methods"
import { parseElements } from "./parser"

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
		extPosRange: ["", ""],                   // Extended node (ID) range
		history: {                               // History object
			correctedPos: false,                   // Corrected pos before first change event?
			stack: [                               // History state stack
				{                                    //
					data,                              //
					nodes,                             //
					pos1: { ...pos1 },                 //
					pos2: { ...pos1 },                 //
				},                                   //
			],                                     //
			index: 0,                              // History state stack index
		},                                       //
		reactVDOM: parseElements(nodes),         // React VDOM
		reactDOM: document.createElement("div"), // React-managed DOM
	}
	return initialState
}

const methods = state => ({
	// Registers props.
	registerProps({ readOnly, focused }) {
		if (readOnly !== undefined) {
			state.readOnly = readOnly
		}
		if (focused !== undefined) {
			state.focused = focused
		}
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
		// Decrement by 2:
		let y1 = pos1.y - 2
		if (y1 < 0) {
			y1 = 0
		}
		// Increment by 2:
		let y2 = pos2.y + 2
		if (y2 >= state.nodes.length) {
			y2 = state.nodes.length - 1
		}
		const extPosRange = [state.nodes[y1].id, state.nodes[y2].id]
		Object.assign(state, { pos1, pos2, extPosRange })
	},
	// Mutates the editor; corrects pos on first mutation and
	// drops redo states.
	mutate() {
		if (!state.history.index && !state.history.correctedPos) {
			Object.assign(state.history.stack[0], {
				pos1: { ...state.pos1 },
				pos2: { ...state.pos2 },
			})
			state.history.correctedPos = true
		}
		this.dropRedos()
	},
	// Drops L and R bytes.
	dropBytes(dropL, dropR) {
		this.mutate()

		// LHS:
		state.pos1.pos -= dropL
		while (dropL) {
			const offset = state.pos1.x
			if (dropL <= offset) {
				state.pos1.x -= dropL
				dropL = 0
				break
			}
			dropL -= offset + 1
			state.pos1.y--
 			// Reset to EOL:
			state.pos1.x = state.nodes[state.pos1.y].data.length
		}
		// RHS:
		state.pos2.pos += dropR
		while (dropR) {
			const reverseOffset = state.nodes[state.pos2.y].data.length - state.pos2.x
			if (dropR <= reverseOffset) {
				state.pos2.x += dropR
				dropR = 0
				break
			}
			dropR -= reverseOffset + 1
			state.pos2.y++
 			// Reset to BOL:
			state.pos2.x = 0
		}
		this.write("") // FIXME?
	},
	// Writes character data.
	write(data) {
		this.mutate()

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
		this.mutate()

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
	// Backspaces one rune.
	backspaceRune() {
		let dropL = 0
		if (state.pos1.pos === state.pos2.pos && state.pos1.pos) {
			const substr = state.data.slice(0, state.pos1.pos)
			const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
			dropL = rune.length
		}
		this.dropBytes(dropL, 0)
	},
	// Forward-backspaces one rune.
	forwardBackspaceRune() {
		let dropR = 0
		if (state.pos1.pos === state.pos2.pos && state.pos1.pos < state.data.length) {
			const substr = state.data.slice(state.pos1.pos)
			const rune = emojiTrie.atStart(substr)?.emoji || utf8.atStart(substr)
			dropR = rune.length
		}
		this.dropBytes(0, dropR)
	},
	// Backspaces one word.
	backspaceWord() {
		if (state.pos1.pos !== state.pos2.pos) {
			this.write("")
			return
		}
		// Iterate spaces:
		let { pos } = state.pos1
		while (pos) {
			const substr = state.data.slice(0, pos)
			const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
			if (!utf8.isHWhiteSpace(rune)) {
				// No-op
				break
			}
			pos -= rune.length
		}
		// Iterate alphanumerics OR non-alphanumerics based on
		// the next rune:
		const substr = state.data.slice(0, pos)
		const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
		if (!rune.length) {
			// No-op; defer to end
		// Iterate alphanumerics:
		} else if (utf8.isAlphanum(rune)) {
			while (pos) {
				const substr = state.data.slice(0, pos)
				const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
				if (!utf8.isAlphanum(rune) || utf8.isWhiteSpace(rune)) {
					// No-op
					break
				}
				pos -= rune.length
			}
		// Iterate non-alphanumerics:
		} else {
			while (pos) {
				const substr = state.data.slice(0, pos)
				const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
				if (utf8.isAlphanum(rune) || utf8.isWhiteSpace(rune)) {
					// No-op
					break
				}
				pos -= rune.length
			}
		}
		let dropL = state.pos1.pos - pos
		if (!dropL && pos - 1 >= 0 && state.data[pos - 1] === "\n") {
			dropL = 1
		}
		this.dropBytes(dropL, 0)
	},
	// Forward-backspaces one word.
	forwardBackspaceWord() {
		if (state.pos1.pos !== state.pos2.pos) {
			this.write("")
			return
		}
		// Iterate spaces:
		let { pos } = state.pos1
		while (pos < state.data.length) {
			const substr = state.data.slice(pos)
			const rune = emojiTrie.atStart(substr) || utf8.atStart(substr)
			if (!utf8.isHWhiteSpace(rune)) {
				// No-op
				break
			}
			pos += rune.length
		}
		// Iterate alphanumerics OR non-alphanumerics based on
		// the next rune:
		const substr = state.data.slice(pos)
		const rune = emojiTrie.atStart(substr)?.emoji || utf8.atStart(substr)
		if (!rune.length) {
			// No-op; defer to end
		// Iterate alphanumerics:
		} else if (utf8.isAlphanum(rune)) {
			while (pos < state.data.length) {
				const substr = state.data.slice(pos)
				const rune = emojiTrie.atStart(substr)?.emoji || utf8.atStart(substr)
				if (!utf8.isAlphanum(rune) || utf8.isWhiteSpace(rune)) {
					// No-op
					break
				}
				pos += rune.length
			}
		// Iterate non-alphanumerics:
		} else {
			while (pos < state.data.length) {
				const substr = state.data.slice(pos)
				const rune = emojiTrie.atStart(substr)?.emoji || utf8.atStart(substr)
				if (utf8.isAlphanum(rune) || utf8.isWhiteSpace(rune)) {
					// No-op
					break
				}
				pos += rune.length
			}
		}
		let dropR = pos - state.pos1.pos
		if (!dropR && pos < state.data.length && state.data[pos] === "\n") {
			dropR = 1
		}
		this.dropBytes(0, dropR)
	},
	// Backspaces one paragraph.
	backspaceParagraph() {
		if (state.pos1.pos !== state.pos2.pos) {
			this.write("")
			return
		}
		// Iterate non-breaks:
		let { pos } = state.pos1
		while (pos) {
			const substr = state.data.slice(0, pos)
			const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
			if (utf8.isVWhiteSpace(rune)) {
				// No-op
				break
			}
			pos -= rune.length
		}
		let dropL = state.pos1.pos - pos
		if (!dropL && pos - 1 >= 0 && state.data[pos - 1] === "\n") {
			dropL = 1
		}
		this.dropBytes(dropL, 0)
	},
	// Inserts a tab character at the insertion point.
	tab() {
		this.write("\t")
	},
	// Tabs one-to-many paragraphs.
	tabMany() {
		this.mutate()
		const nodes = state.nodes.slice(state.pos1.y, state.pos2.y + 1)
		for (let x = 0; x < nodes.length; x++) {
			// if (nodes[x].data.length && nodes[x].data.slice(0, 20) === "\t".repeat(20)) {
			// 	// No-op
			// 	continue
			// }
			nodes[x].data = `\t${nodes[x].data}`
			if (!x) {
				state.pos1.pos++
			}
			state.pos2.pos++
		}
		this.render()
	},
	// Detabs one-to-many paragraphs.
	detabMany() {
		this.mutate()
		const nodes = state.nodes.slice(state.pos1.y, state.pos2.y + 1)
		for (let x = 0; x < nodes.length; x++) {
			if (!nodes[x].data.length || nodes[x].data[0] !== "\t") {
				// No-op
				continue
			}
			nodes[x].data = nodes[x].data.slice(1)
			if (!x) {
				state.pos1.pos--
			}
			state.pos2.pos--
		}
		this.render()
	},
	// Inserts an EOL character.
	enter(syntax = "") {
		this.write(`\n${syntax}`)
	},

	// // Inserts an auto-completing EOL.
	// enterSyntax(synax) {
	// 	this.write(`\n${synax}`)
	// },

	// Toggles a todo (checkbox).
	toggleTodo(id) {
		const node = state.nodes.find(each => each.id === id)
		console.log({ ...node })
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
		// Reset correctedPos on the first or the second-to-
		// first undo:
		if (state.history.index <= 1 && state.history.correctedPos) {
			state.history.correctedPos = false
		}
		// Bounds check:
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
		// Bounds check:
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

		// let t = Date.now()
		// const data = state.nodes.map(each => each.data).join("\n")
		// console.log(Date.now() - t)
		// t = Date.now()
		// const reactVDOM = parseElements(state.nodes)
		// console.log(Date.now() - t)
		// Object.assign(state, {
		// 	data,
		// 	reactVDOM,
		// })

		Object.assign(state, {
			data: state.nodes.map(each => each.data).join("\n"),
			reactVDOM: parseElements(state.nodes),
		})
	},
})

function useEditor(initialValue) {
	return useMethods(methods, {}, () => newEditorState(initialValue))
}

export default useEditor
