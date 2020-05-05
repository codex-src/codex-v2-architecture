import { NumberEnum } from "lib/Enum"

const typeEnum = new NumberEnum(
	// Elements:
	"AnyList",
	"AnyListItem",
	"Blockquote",
	"BlockquoteItem",
	"Break",
	"Header",
	"Paragraph",
	"Preformatted",
	"TodoItem",

	// Inline elements:
	"Anchor",
	"Code",
	"Emoji",
	"Emphasis",
	"Escape",
	"Strikethrough",
	"Strong",
	"StrongEmphasis",
)

export default typeEnum
