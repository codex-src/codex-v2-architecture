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

// NOTE: DO NOT USE -- DOES NOT WORK AS EXPECTED
//
// // Matches a key code event.
// //
// // NOTE: shiftKey, altKey, and metaOrCtrlKey do not
// // passthrough
// function matchKeyCode(e, keyCode, { shiftKey, altKey, metaOrCtrlKey }) {
// 	const ok = (
// 		e.shiftKey === Boolean(shiftKey) &&
// 		e.altKey === Boolean(altKey) &&
// 		isMetaOrCtrlKey(e) === Boolean(metaOrCtrlKey) &&
// 		e.keycode === keyCode
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
	const opt1 = (
		e.shiftKey &&
		!e.altKey &&
		isMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	const opt2 = (
		!e.shiftKey &&
		!e.altKey &&
		isMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Y
	)
	return opt1 || opt2
}
