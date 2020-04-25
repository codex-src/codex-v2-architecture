import keyCodes from "./keyCodes"

// Returns whether an key down event exclusively uses the
// meta (command: ⌘) or control key.
//
// https://css-tricks.com/snippets/javascript/test-mac-pc-javascript
export function isMetaOrCtrlKey(e) {
	if (navigator.userAgent.includes("Mac OS X")) {
		return !e.ctrlKey && e.metaKey
	}
	return e.ctrlKey && !e.metaKey
}

// // Detects whether a key down event is backspace RTL.
// export function detectBackspaceRTL(e) {
// 	const ok = (
// 		!e.shiftKey &&
// 		!e.altKey &&
// 		!isMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCodes.backspace
// 	)
// 	return ok
// }
//
// // Detects whether a key down event is backspace word RTL.
// export function detectBackspaceWordRTL(e) {
// 	const ok = (
// 		!e.shiftKey &&
// 		!e.altKey &&
// 		isMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCodes.Z
// 	)
// 	return ok
// }
//
// // Detects whether a key down event is backspace paragraph
// // RTL.
// export function detectBackspaceParagraphRTL(e) {
// 	const ok = (
// 		!e.shiftKey &&
// 		!e.altKey &&
// 		isMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCodes.Z
// 	)
// 	return ok
// }
//
// // Detects whether a key down event is backspace LTR.
// export function detectBackspaceLTR(e) {
// 	const ok = (
// 		!e.shiftKey &&
// 		!e.altKey &&
// 		isMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCodes.Z
// 	)
// 	return ok
// }
//
// // Detects whether a key down event is backspace word LTR.
// export function detectBackspaceLTRWord(e) {
// 	const ok = (
// 		!e.shiftKey &&
// 		!e.altKey &&
// 		isMetaOrCtrlKey(e) &&
// 		e.keyCode === keyCodes.Z
// 	)
// 	return ok
// }

// detectBackspaceRTL
// detectBackspaceWordRTL
// detectBackspaceParagraphRTL
// detectBackspaceLTR
// detectBackspaceLTRWord

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
