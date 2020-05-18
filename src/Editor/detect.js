import keyCodes from "./keyCodes"
import usesMetaOrCtrlKey from "lib/usesMetaOrCtrlKey"

// Detects whether a key down event is undo.
export function detectUndo(e) {
	const ok = (
		!e.shiftKey &&
		!e.altKey &&
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	return ok
}

// Detects whether a key down event is redo.
export function detectRedo(e) {
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
