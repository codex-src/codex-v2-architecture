import * as emojiTrie from "emoji-trie"
import * as utf8 from "lib/encoding/utf8"
import LRUCache from "lib/LRUCache"
import UndoManager from "lib/UndoManager"
import parseElements from "./parser/parseElements"
import useMethods from "use-methods"

import {
	newNodes,
	newPos,
} from "./constructors"

import {
	AnyListRe,
	TaskListRe,
} from "./parser/spec"

// Prepares a new editor state (for useEditor).
function newEditorState(data) {
	const nodes = newNodes(data)
	const [pos1, pos2] = [newPos(), newPos()]
	const initialState = { data, nodes, pos1, pos2 }
	// Returns whether the current and next state are equal.
	const areEqual = (currentState, nextState) => {
		const ok = (
			currentState.data.length === nextState.data.length &&
			currentState.data === nextState.data
		)
		return ok
	}
	const cachedElements = new LRUCache(100)
	const editorState = {
		readOnly: false,                                  // Is read-only?
		focused: false,                                   // Is focused?
		data,                                             // Document data (string)
		nodes,                                            // Document nodes
		pos1,                                             // Start cursor data structure
		pos2,                                             // End cursor data structure
		collapsed: true,                                  // Are the cursors collapsed?
		extPosRange: ["", ""],                            // Extended node (root ID) range
		history: new UndoManager(initialState, areEqual), // Undo manager
		cachedElements,                                   // LRU cached parsed elements
		elements: parseElements(nodes, cachedElements),   // Parsed elements
	}
	return editorState
}

const methods = state => ({
	// Registers props.
	registerProps({ readOnly, autoFocus }) {
		Object.assign(state, {
			readOnly: Boolean(readOnly),
			focused:  Boolean(autoFocus),
		})
	},
	// Toggles read-only mode.
	toggleReadOnly() {
		Object.assign(state, {
			readOnly: !state.readOnly,
			focused:  false,
		})
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
		// Decrement 2x:
		let y1 = pos1.y - 2
		if (y1 < 0) {
			y1 = 0
		}
		// Increment 2x:
		let y2 = pos2.y + 2
		if (y2 >= state.nodes.length) {
			y2 = state.nodes.length - 1
		}
		const extPosRange = [state.nodes[y1].id, state.nodes[y2].id]
		Object.assign(state, {
			pos1,
			pos2,
			collapsed: pos1.pos === pos2.pos,
			extPosRange,
		})
	},

	// Resets character data.
	reset(data) {
		Object.assign(state, {
			focused: false,
			nodes: newNodes(data),
			pos1: newPos(),
			pos2: newPos(),
		})
		this.render()
	},

	// Writes character data.
	//
	// FIXME: write does **not** update pos.x and pos.y
	write(data) {
		state.history.mutate()

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
		Object.assign(state, {
			pos1,
			pos2,
		})
		this.render()
	},
	// Drops L and R bytes.
	dropBytes(dropL, dropR) {
		state.history.mutate()

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
		this.write("")
	},
	// Input method for onCompositionEnd and onInput.
	input(nodes, atEnd, [pos1, pos2]) {
		state.history.mutate()

		// Get the start offset:
		const key1 = nodes[0].id
		// TODO: Can no-op keys before extPosRange[0]
		const offset1 = state.nodes.findIndex(each => each.id === key1)
		if (offset1 === -1) {
			throw new Error("input: offset1 out of bounds")
		}
		// Get the end offset:
		const key2 = nodes[nodes.length - 1].id
		// TODO: Can no-op keys before extPosRange[0]
		const offset2 = !atEnd ? state.nodes.findIndex(each => each.id === key2) : state.nodes.length - 1
		if (offset2 === -1) {
			throw new Error("input: offset2 out of bounds")
		}

		// Update and rerender:
		state.nodes.splice(offset1, offset2 - offset1 + 1, ...nodes)
		Object.assign(state, {
			pos1,
			pos2,
		})
		this.render()
	},
	// Backspaces one rune.
	backspaceRune() {
		state.history.mutate()

		let dropL = 0
		if (state.collapsed && state.pos1.pos) {
			const substr = state.data.slice(0, state.pos1.pos)
			const rune = emojiTrie.atEnd(substr)?.emoji || utf8.atEnd(substr)
			dropL = rune.length
		}
		this.dropBytes(dropL, 0)
	},
	// Forward-backspaces one rune.
	forwardBackspaceRune() {
		state.history.mutate()

		let dropR = 0
		if (state.collapsed && state.pos1.pos < state.data.length) {
			const substr = state.data.slice(state.pos1.pos)
			const rune = emojiTrie.atStart(substr)?.emoji || utf8.atStart(substr)
			dropR = rune.length
		}
		this.dropBytes(0, dropR)
	},
	// Backspaces one word.
	backspaceWord() {
		state.history.mutate()

		if (!state.collapsed) {
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
		if (!rune) {
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
		state.history.mutate()

		if (!state.collapsed) {
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
		if (!rune) {
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
		state.history.mutate()

		if (!state.collapsed) {
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
	// Inserts a tab character.
	tab(shiftKey) {
		state.history.mutate()

		const node = state.nodes[state.pos1.y]
		if (state.collapsed && !AnyListRe.test(node.data)) {
			this.write("\t")
		} else if (!shiftKey) {
			this.tabMany()
		} else {
			this.detabMany()
		}
	},
	// Tabs one-to-many paragraphs.
	tabMany() {
		state.history.mutate()

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
		state.history.mutate()

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
	enter() {
		state.history.mutate()

		const node = state.nodes[state.pos1.y]
		if (state.collapsed && state.pos1.x === node.data.length && AnyListRe.test(node.data)) {
			const [, tabs, syntax] = node.data.match(AnyListRe)
			if ((tabs + syntax) === node.data) {
				this.backspaceParagraph() // Revert to paragraph
				return
			}
			let autoSyntax = tabs + syntax
			if (TaskListRe.test(autoSyntax)) {
				autoSyntax = `${tabs}- [ ] ` // Prefer unchecked for added todos
			}
			this.write(`\n${autoSyntax}`)
			return
		}
		this.write("\n")
	},
	// Checks or unchecks a todo.
	checkTodo(id) {
		state.history.mutate()

		const node = state.nodes.find(each => each.id === id)
		let [, tabs, syntax] = node.data.match(AnyListRe)
		if (syntax === "- [ ] ") {
			syntax = "- [x] "
		} else {
			syntax = "- [ ] "
		}
		node.data = tabs + syntax + node.data.slice((tabs + syntax).length)
		this.render()
	},
	// Cuts character data.
	cut() {
		state.history.mutate()
		this.write("")
	},
	// Copies character data.
	copy() {
		// No-op
	},
	// Pastes character data.
	paste(pasteData) {
		state.history.mutate()
		this.write(pasteData)
	},
	// Pushes the next undo state.
	pushUndo() {
		// Copy the current state:
		const currentState = {
			data: state.data,
			nodes: state.nodes.map(each => ({ ...each })),
			pos1: { ...state.pos1 },
			pos2: { ...state.pos2 },
		}
		state.history.push(currentState)
	},
	// Undos once.
	undo() {
		// Copy the current state:
		const currentState = {
			data: state.data,
			nodes: state.nodes.map(each => ({ ...each })),
			pos1: { ...state.pos1 },
			pos2: { ...state.pos2 },
		}
		const nextState = state.history.undo(currentState)
		if (!nextState) {
			// No-op
			return
		}
		Object.assign(state, nextState)
		this.render()
	},
	// Redos once.
	redo() {
		const nextState = state.history.redo()
		if (!nextState) {
			// No-op
			return
		}
		Object.assign(state, nextState)
		this.render()
	},
	// Rerenders the string and VDOM representations.
	render() {
		const data = state.nodes.map(each => each.data).join("\n")
		const elements = parseElements(state.nodes, state.cachedElements)
		Object.assign(state, {
			data,
			elements,
		})
	},
})

function useEditor(initialValue) {
	return useMethods(methods, {}, () => newEditorState(initialValue))
}

export default useEditor
