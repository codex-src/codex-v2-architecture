import Enum from "Enum"

const typeEnum = new Enum(
	// Elements:
	"Blockquote",
	"BlockquoteItem",
	"Break",
	"CodeBlock",
	"Header",
	"Paragraph",

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
