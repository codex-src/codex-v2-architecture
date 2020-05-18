// import keyCodes from "./keyCodes"
import usesMetaOrCtrlKey from "lib/usesMetaOrCtrlKey"

const keyCodes = {
	Tab: 9,       // Tab
	Enter: 13,    // EOL

	Backspace: 8, // Backspace
	Delete: 46,   // Delete
	D: 68,        // Delete (macOS)

	Y: 89,        // Redo
	Z: 90,        // Undo and redo

	A: 65,        // Select-all
	X: 88,        // Cut
	C: 67,        // Copy
	V: 86,        // Paste
}

// export function selectAll(e) {
// 	const ok = (
// 		usesMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCode.a
// 	)
// 	return ok
// }
// export function cut() {
// }
// export function copy() {
// }
// export function paste() {
// }

export function undo(e) {
	const ok = (
		!e.shiftKey &&
		!e.altKey &&
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	return ok
}

export function redo(e) {
	const ok1 = (
		e.shiftKey &&
		!e.altKey &&
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	const ok2 = (
		!e.shiftKey &&
		!e.altKey &&
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Y
	)
	return ok1 || ok2
}


// // NOTE: Safari registers select-all, cut, copy,
// // and paste as key press events
// if (navigator.vendor === "Apple Computer, Inc." && (
// 	e.keyCode === keyCodes.A ||
// 	e.keyCode === keyCodes.X ||
// 	e.keyCode === keyCodes.C ||
// 	e.keyCode === keyCodes.V
// )) {
// 	// No-op
// 	return
// }
// // Tab:
// if (!e.ctrlKey && e.keyCode === keyCodes.Tab) {
// 	const focusedCheckbox = document.activeElement.getAttribute("data-codex-checkbox")
// 	if (focusedCheckbox) {
// 		// No-op
// 		return
// 	}
// 	e.preventDefault()
// 	dispatch.tab(e.shiftKey)
// 	return
// // Enter:
// } else if (e.keyCode === keyCodes.Enter) {
// 	e.preventDefault()
// 	dispatch.enter()
// 	return
// }
// // Backspace paragraph:
// if (usesMetaOrCtrlKey(e) && e.keyCode === keyCodes.Backspace) {
// 	e.preventDefault()
// 	dispatch.backspaceParagraph()
// 	return
// // Backspace word:
// //
// // FIXME: e.altKey for non-macOS?
// } else if (e.altKey && e.keyCode === keyCodes.Backspace) {
// 	e.preventDefault()
// 	dispatch.backspaceWord()
// 	return
// // Backspace rune:
// } else if (e.keyCode === keyCodes.Backspace) {
// 	e.preventDefault()
// 	dispatch.backspaceRune()
// 	return
// // Forward-backspace word:
// } else if (navigator.userAgent.indexOf("Mac OS X") !== -1 && e.altKey && e.keyCode === keyCodes.Delete) {
// 	e.preventDefault()
// 	dispatch.forwardBackspaceWord()
// 	return
// // Forward-backspace rune:
// } else if (e.keyCode === keyCodes.Delete || (navigator.userAgent.indexOf("Mac OS X") !== -1 && e.ctrlKey && e.keyCode === keyCodes.D)) {
// 	e.preventDefault()
// 	dispatch.forwardBackspaceRune()
// 	return
// }
// // Undo:
// if (detectUndo(e)) {
// 	e.preventDefault()
// 	const { data, nodes, pos1, pos2 } = state
// 	const currentState = { data, nodes, pos1, pos2 }
// 	dispatch.undo(currentState)
// 	return
// // Redo:
// } else if (detectRedo(e)) {
// 	e.preventDefault()
// 	dispatch.redo()
// 	return
// }
//
// // TODO: Cut, copy, paste need to passthrough
// if (state.pos1.pos !== state.pos2.pos && ((!e.ctrlKey && !e.altKey && !e.metaKey && [...e.key].length === 1) || e.key === "Dead")) {
// 	e.preventDefault()
// 	dispatch.write(e.key !== "Dead" ? e.key : "")
// 	return
// }
