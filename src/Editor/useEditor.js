import * as ascii from "lib/encoding/ascii"
import * as posIterators from "./posIterators"
import LRUCache from "lib/LRUCache"
import parseElements from "./parser/parseElements"
import UndoManager from "lib/UndoManager"
import useMethods from "use-methods"
import uuidv4 from "uuid/v4"
import { AnyListRegex } from "./regexes"
import { ascendToElement } from "./documentNodes/ascend"

import {
	newNodes,
	newPos,
} from "./constructors"

// Returns whether two states are equal; for UndoManager.
function areEqual(current, next) {
	const ok = (
		current.data.length === next.data.length &&
		current.data === next.data
	)
	return ok
}

// Prepares a new editor state (for useEditor).
function newEditorState(data) {
	const nodes = newNodes(data)
	const [pos1, pos2] = [newPos(), newPos()]
	const initialState = { data, nodes, pos1, pos2 }
	const cachedElements = new LRUCache(500)
	const editorState = {
		readOnly: false,                                  // Is read-only?
		focused: false,                                   // Is focused?
		data,                                             // Document data (string)
		nodes,                                            // Document nodes
		pos1,                                             // Start cursor data structure
		pos2,                                             // End cursor data structure
		collapsed: true,                                  // Are the cursors collapsed?
		history: new UndoManager(initialState, areEqual), // Undo manager
		cachedElements,                                   // LRU cached parsed elements
		elements: parseElements(nodes, cachedElements),   // Parsed elements
	}
	return editorState
}

const methods = state => ({
	// Registers props.
	//
	// TODO: Deprecate?
	registerProps({ readOnly, autoFocus }) {
		Object.assign(state, {
			readOnly: Boolean(readOnly),
			focused:  Boolean(autoFocus),
		})
	},
	// Toggles read-only mode.
	//
	// TODO: Add previewMode -- readOnlyMode and previewMode
	// are not the same; previewMode relies on readOnlyMode
	// and disabling markdown syntax
	toggleReadOnly() {
		Object.assign(state, {
			readOnly: !state.readOnly,
			focused:  false,
		})
	},

	/*
	 * Cursors
	 */
	focus() {
		state.focused = true
	},
	blur() {
		state.focused = false
	},
	select(pos1, pos2) {
		Object.assign(state, {
			pos1,
			pos2,
			collapsed: pos1.pos === pos2.pos,
		})
	},

	// TODO: Correct pos.x and pos.y?
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

	input(data, pos1, renderOptions = { currentRootID: "", isComposing: true }) {
		state.history.mutate()

		state.nodes[state.pos1.y].data = data
		Object.assign(state, {
			pos1,
			pos2: { ...pos1 },
		})
		this.render(renderOptions)
	},

	/*
	 * Backspace and forward-backsapce
	 */
	backspaceRune() {
		if (!state.collapsed) {
			this.write("")
			return
		}
		// TODO: Change posIterators API to return
		// [dropL, dropR]?
		const bytes = posIterators.backspace.rune(state.data, state.pos1.pos)
		this.dropBytes(bytes, 0)
	},
	forwardBackspaceRune() {
		if (!state.collapsed) {
			this.write("")
			return
		}
		// TODO: Change posIterators API to return
		// [dropL, dropR]?
		const bytes = posIterators.forwardBackspace.rune(state.data, state.pos1.pos)
		this.dropBytes(0, bytes)
	},
	backspaceWord() {
		if (!state.collapsed) {
			this.write("")
			return
		}
		// TODO: Change posIterators API to return
		// [dropL, dropR]?
		const bytes = posIterators.backspace.word(state.data, state.pos1.pos)
		this.dropBytes(bytes, 0)
	},
	forwardBackspaceWord() {
		if (!state.collapsed) {
			this.write("")
			return
		}
		// TODO: Change posIterators API to return
		// [dropL, dropR]?
		const bytes = posIterators.forwardBackspace.word(state.data, state.pos1.pos)
		this.dropBytes(0, bytes)
	},
	backspaceParagraph() {
		if (!state.collapsed) {
			this.write("")
			return
		}
		// TODO: Change posIterators API to return
		// [dropL, dropR]?
		const bytes = posIterators.backspace.paragraph(state.data, state.pos1.pos)
		this.dropBytes(bytes, 0)
	},

	// Inserts a tab character.
	tab(shiftKey) { // TODO: Rename shiftKey
		state.history.mutate()

		const node = state.nodes[state.pos1.y]
		if (state.collapsed && !AnyListRegex.test(node.data)) {
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
			// if (nodes[x].data.length && nodes[x].data.startsWith("\t".repeat(20)) {
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
		if (state.collapsed && AnyListRegex.test(node.data)) {
			const [, tabs, syntax] = node.data.match(AnyListRegex)
			if ((tabs + syntax) === node.data) {
				this.backspaceParagraph() // Revert to paragraph
				return
			}
			let auto = tabs + syntax
			if (syntax === "- [ ] " || syntax === "- [x] ") {
				auto = `${tabs}- [ ] `
			}
			this.write(`\n${auto}`)
			return
		}
		this.write("\n")
	},
	// Checks or unchecks a todo.
	checkTodo(id) {
		this.blur()

		state.history.mutate()

		const node = state.nodes.find(each => each.id === id)
		let [, tabs, syntax] = node.data.match(AnyListRegex)
		if (syntax === "- [ ] ") {
			syntax = "- [x] "
		} else {
			syntax = "- [ ] "
		}
		node.data = tabs + syntax + node.data.slice((tabs + syntax).length)
		this.render()
	},

	cut() {
		state.history.mutate()
		this.write("")
	},
	copy() {
		// No-op
	},
	paste(pasteData) {
		state.history.mutate()
		this.write(pasteData)
	},

	/*
	 * Undo
	 */
	pushUndo() {
		const currentState = {
			data: state.data,
			nodes: state.nodes.map(each => ({ ...each })),
			pos1: { ...state.pos1 },
			pos2: { ...state.pos2 },
		}
		state.history.push(currentState)
	},
	undo() {
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
	redo() {
		const nextState = state.history.redo()
		if (!nextState) {
			// No-op
			return
		}
		Object.assign(state, nextState)
		this.render()
	},

	/*
	 * Render
	 */
	render(renderOptions = { currentRootID: "", isComposing: false }) {
		const data = state.nodes.map(each => each.data).join("\n")
		if (renderOptions.isComposing) {
			state.data = data
			return
		}

		const t = Date.now()
		const nextElements = parseElements(state.nodes, state.cachedElements)
		console.log("parseElements", Date.now() - t)

		// if (renderOptions.currentRootID) {
		// 	let id = ""
		// 	const selection = document.getSelection()
		// 	if (selection.rangeCount) {
		// 		const range = selection.getRangeAt(0)
		// 		const root = ascendToElement(range.startContainer).closest("[data-codex-editor] > *")
		// 		id = root.id || root.querySelector("[id]").id
		// 	}
		// 	console.log({ id, currentRootID: renderOptions.currentRootID })
		// 	const nextElement = nextElements.find(each => each.id === id)
		// 	if (nextElement) {
		// 		nextElement.reactKey = uuidv4().slice(0, 8)
		// 	}
		// }

		// TODO (1): Extract to nativeRenderingStrategy(state)
		// TODO (2): We can refactor pos.id.root and pos.id.node
		if (renderOptions.currentRootID) {

			const substr = state.nodes[state.pos1.y].data.slice(state.pos1.x - 2, state.pos1.x - 1)
			const forceRerender = (
				state.pos1.x === 1 ||
				substr.split("").some(each => ascii.isPunctuation(each))
			)

			const nextElement = nextElements.find(each => each.id === renderOptions.currentRootID)
			if (nextElement && forceRerender) {
				nextElement.reactKey = uuidv4().slice(0, 8)
			}

		}

		Object.assign(state, {
			data,
			elements: nextElements,
		})
	},
})

function useEditor(initialValue) {
	return useMethods(methods, {}, () => newEditorState(initialValue))
}

export default useEditor
