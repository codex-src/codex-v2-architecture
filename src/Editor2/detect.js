import keyCodes from "./keyCodes"

// Returns whether an key down event exclusively uses the
// meta (command: ⌘) or control key.
//
// https://css-tricks.com/snippets/javascript/test-mac-pc-javascript
function isMetaOrCtrlKey(e) {
	if (navigator.userAgent.includes("Mac OS X")) {
		return !e.ctrlKey && e.metaKey
	}
	return e.ctrlKey && !e.metaKey
}

// // Detects whether a key down event matches a key code.
// export function keyCode(e, keyCode, { shiftKey } = { shiftKey: false }) {
// 	const ok = (
// 		e.shiftKey === shiftKey &&
// 		!e.altKey &&
// 		isMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCode // XOR
// 	)
// 	return ok
// }

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
	const ok = (
		e.shiftKey &&
		!e.altKey &&
		isMetaOrCtrlKey(e) &&
		(e.keyCode === keyCodes.Z || e.keyCode === keyCodes.Y)
	)
	return ok
}
