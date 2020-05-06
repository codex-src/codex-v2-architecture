// Describes a history state stack and index manager.
class UndoManager {
	constructor(initialState, areEqual) {
		Object.assign(this, {
			__areEqual: areEqual,

			stack: [initialState],
			index: 0,
		})
	}
	// Pushes the next undo state.
	push(currentState) {
		const nextState = this.stack[this.index]
		if (this.__areEqual(currentState, nextState)) {
			// No-op
			return
		}
		this.stack.push(currentState)
		this.index++
	}
	// Mutates the history state stack.
	mutate() {
		this.stack.splice(this.index + 1)
	}
	// Undos up to one state and returns the n - 1 state.
	undo(currentState) {
		if (!this.index) {
			return null
		}
		const { index } = this
		if (this.index + 1 === this.stack.length) {
			this.push(currentState)
		}
		this.index = index - 1
		return this.stack[this.index]
	}
	// Redos up to one state and returns the n + 1 state.
	redo() {
		if (this.index + 1 === this.stack.length) {
			return null
		}
		this.index++
		return this.stack[this.index]
	}
	// Peeks the start state.
	peekStart() {
		return this.stack[0]
	}
	// Peeks the end state.
	peekEnd() {
		return this.stack[this.index]
	}
}

export default UndoManager
