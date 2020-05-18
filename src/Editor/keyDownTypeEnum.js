import { StringEnum } from "lib/Enums"

const keyDownTypeEnum = new StringEnum(
	// Tab and EOL:
	"tab",
	"enter",

	// Backspace etc.:
	"backspaceParagraph",
	"backspaceWord",
	"backspaceRune",

	// Forward backspace etc.:
	"forwardBackspaceWord",
	"forwardBackspaceRune",

	// Undo and redo:
	"undo",
	"redo",

	// Character data:
	"characterData",
)

export default keyDownTypeEnum
