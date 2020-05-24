import { StringEnum } from "lib/Enums"

const keyDownTypeEnum = new StringEnum(
	"tab",
	"enter",

	"backspaceParagraph",
	"backspaceWord",
	"backspaceRune",
	"forwardBackspaceWord",
	"forwardBackspaceRune",

	"undo",
	"redo",

	"characterData",
)

export default keyDownTypeEnum
