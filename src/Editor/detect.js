import keyCodes from "./keyCodes"

// Returns whether an key down event exclusively uses the
// meta (command: ⌘) or ctrl (control: ^) key.
//
// https://css-tricks.com/snippets/javascript/test-mac-pc-javascript
export function isMetaOrCtrlKey(e) {
	if (navigator.userAgent.includes("Mac OS X")) {
		return !e.ctrlKey && e.metaKey
	}
	return e.ctrlKey && !e.metaKey
}

// Detects whether a key down event is undo.
export function detectUndo(e) {
	const ok = (
		!e.shiftKey &&
		!e.altKey &&
		isMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	return ok
}

// Detects whether a key down event is redo.
export function detectRedo(e) {
	const ok1 = (
		e.shiftKey &&
		!e.altKey &&
		isMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	const ok2 = (
		!e.shiftKey &&
		!e.altKey &&
		isMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Y
	)
	return ok1 || ok2
}
