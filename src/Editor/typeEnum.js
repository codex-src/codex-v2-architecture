import Enum from "lib/Enum"

const typeEnum = new Enum(
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
