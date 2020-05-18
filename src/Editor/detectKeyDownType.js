import keyDownTypeEnum from "./keyDownTypeEnum"
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

const detect = {
	tab(e) {
		const ok = (
			!e.ctrlKey && // Negates control-tab and shift-control-tab shortcuts
			e.keyCode === keyCodes.Tab
		)
		return ok
	},
	enter(e) {
		return e.keyCode === keyCodes.Enter
	},
	// NOTE: detect.backspace* are ordered by precedence
	backspaceParagraph(e) {
		const ok = (
			usesMetaOrCtrlKey(e) &&
			e.keyCode === keyCodes.Backspace
		)
		return ok
	},
	// TODO: Do non-macOS systems support backspace word?
	backspaceWord(e) {
		const ok = (
			e.altKey &&
			e.keyCode === keyCodes.Backspace
		)
		return ok
	},
	backspaceRune(e) {
		return e.keyCode === keyCodes.Backspace
	},
	// NOTE: detect.forwardBackspace* are ordered by
	// precedence
	forwardBackspaceWord(e) {
		// macOS:
		const ok = (
			navigator.userAgent.indexOf("Mac OS X") !== -1 &&
			e.altKey &&
			e.keyCode === keyCodes.Delete
		)
		return ok
	},
	forwardBackspaceRune(e) {
		return e.keyCode === keyCodes.Delete
	},
	forwardBackspaceRuneMacOS(e) {
		const ok = (
			navigator.userAgent.indexOf("Mac OS X") !== -1 &&
			e.ctrlKey &&
			e.keyCode === keyCodes.D
		)
		return ok
	},
	undo(e) {
		const ok = (
			!e.shiftKey &&
			!e.altKey &&
			usesMetaOrCtrlKey(e) &&
			e.keyCode === keyCodes.Z
		)
		return ok
	},
	redo(e) {
		const ok = (
			e.shiftKey &&
			!e.altKey &&
			usesMetaOrCtrlKey(e) &&
			e.keyCode === keyCodes.Z
		)
		return ok
	},
	redoNonMacOS(e) {
		const ok = (
			!e.shiftKey &&
			!e.altKey &&
			usesMetaOrCtrlKey(e) &&
			e.keyCode === keyCodes.Y
		)
		return ok
	},
	// Character data must be:
	//
	// - A non-macro (such as "Enter") or command e.key OR
	// - A "Dead" e.key
	//
	characterData(e) {
		const ok = (
			!usesMetaOrCtrlKey(e) &&
			[...e.key].length === 1
		)
		return ok
	},
	characterDataCompose(e) {
		return e.key === "Dead"
	},
}

// Detects a key down type.
function detectKeyDownType(e) {
	switch (true) {
	case detect.tab(e):
		return keyDownTypeEnum.tab
	case detect.enter(e):
		return keyDownTypeEnum.enter
	// NOTE: detect.backspace* are ordered by precedence
	case detect.backspaceParagraph(e):
		return keyDownTypeEnum.backspaceParagraph
	case detect.backspaceWord(e):
		return keyDownTypeEnum.backspaceWord
	case detect.backspaceRune(e):
		return keyDownTypeEnum.backspaceRune
	// NOTE: detect.forwardBackspace* are ordered by
	// precedence
	case detect.forwardBackspaceWord(e):
		return keyDownTypeEnum.forwardBackspaceWord
	case detect.forwardBackspaceRune(e):
	case detect.forwardBackspaceRuneMacOS(e):
		return keyDownTypeEnum.forwardBackspaceRune
	case detect.undo(e):
		return keyDownTypeEnum.undo
	case detect.redo(e):
	case detect.redoNonMacOS(e):
		return keyDownTypeEnum.redo
	case detect.characterData(e):
	case detect.characterDataCompose(e):
		return keyDownTypeEnum.characterData
	default:
		// No-op
		break
	}
	return ""
}

export default detectKeyDownType
