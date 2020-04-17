import Enum from "Enum"

const typeEnum = new Enum(
	// Elements:
	"Header",
	"Paragraph",
	"Break",

	// Inline elements:
	"Escape",
	"Emoji",
	"Emphasis",
	"Strong",
	"StrongEmphasis",
	"Code",
	"Strikethrough",
)

export default typeEnum
