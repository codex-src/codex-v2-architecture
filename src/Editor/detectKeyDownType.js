import keyDownTypeEnum from "./keyDownTypeEnum"
import usesMetaOrCtrlKey from "lib/usesMetaOrCtrlKey"
import { StringEnum } from "lib/Enums"

const keyCodes = {
	Tab: 9,
	Enter: 13,

	Backspace: 8,
	Delete: 46,
	D: 68,

	Y: 89,
	Z: 90,
}

// NOTE: Negates control because of control-tab and shift-
// control-tab shortcuts
function tab(e) {
	const ok = (
		!e.ctrlKey &&
		e.keyCode === keyCodes.Tab
	)
	return ok
}

function enter(e) {
	return e.keyCode === keyCodes.Enter
}

// NOTE: backspace* are ordered by precedence
function backspaceParagraph(e) {
	const ok = (
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Backspace
	)
	return ok
}
// TODO: e.altKey for non-macOS?
function backspaceWord(e) {
	const ok = (
		e.altKey &&
		e.keyCode === keyCodes.Backspace
	)
	return ok
}

function backspaceRune(e) {
	return e.keyCode === keyCodes.Backspace
}

// NOTE: forwardBackspace* are ordered by precedence
function forwardBackspaceWord(e) {
	// macOS:
	const ok = (
		navigator.userAgent.indexOf("Mac OS X") !== -1 &&
		e.altKey &&
		e.keyCode === keyCodes.Delete
	)
	return ok
}

function forwardBackspaceRune(e) {
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

function undo(e) {
	const ok = (
		!e.shiftKey &&
		!e.altKey &&
		usesMetaOrCtrlKey(e) &&
		e.keyCode === keyCodes.Z
	)
	return ok
}

function redo(e) {
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

// Detects a key down type.
function detectKeyDownType(e) {
	switch (true) {
	case tab(e):
		return keyDownTypeEnum.tab
	case enter(e):
		return keyDownTypeEnum.enter
	case backspaceParagraph(e):
		return keyDownTypeEnum.backspaceParagraph
	case backspaceWord(e):
		return keyDownTypeEnum.backspaceWord
	case backspaceRune(e):
		return keyDownTypeEnum.backspaceRune
	case forwardBackspaceWord(e):
		return keyDownTypeEnum.forwardBackspaceWord
	case forwardBackspaceRune(e):
		return keyDownTypeEnum.forwardBackspaceRune
	case undo(e):
		return keyDownTypeEnum.undo
	case redo(e):
		return keyDownTypeEnum.redo
	default:
		// No-op
		break
	}
	return ""
}

export default detectKeyDownType

