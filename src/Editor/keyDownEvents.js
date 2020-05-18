import usesMetaOrCtrlKey from "lib/usesMetaOrCtrlKey"

const keyCodes = {
	Tab: 9,
	Enter: 13,

	Backspace: 8,
	Delete: 46,
	D: 68,

	Y: 89,
	Z: 90,
}

// export function detect() {
// }

// NOTE: Negates control because of control-tab and shift-
// control-tab shortcuts
export function tab(e) {
	const ok = (
		!e.ctrlKey &&
		e.keyCode === keyCodes.Tab
	)
	return ok
}

export function enter(e) {
	return e.keyCode === keyCodes.Enter
}

// NOTE: backspace* are ordered by precedence
export function backspaceParagraph(e) {
	const ok = (
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Backspace
	)
	return ok
}
// TODO: e.altKey for non-macOS?
export function backspaceWord(e) {
	const ok = (
		e.altKey &&
		e.keyCode === keyCodes.Backspace
	)
	return ok
}

export function backspaceRune(e) {
	return e.keyCode === keyCodes.Backspace
}

// NOTE: forwardBackspace* are ordered by precedence
export function forwardBackspaceWord(e) {
	// macOS:
	const ok = (
		navigator.userAgent.indexOf("Mac OS X") !== -1 &&
		e.altKey &&
		e.keyCode === keyCodes.Delete
	)
	return ok
}

export function forwardBackspaceRune(e) {
	const ok1 = (
		e.keyCode === keyCodes.Delete
	)
	// macOS:
	const ok2 = (
		navigator.userAgent.indexOf("Mac OS X") !== -1 &&
		e.ctrlKey &&
		e.keyCode === keyCodes.D
	)
	return ok1 || ok2
}

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
	// macOS:
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
