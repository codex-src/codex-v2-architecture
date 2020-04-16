import Enum from "Enum"

const typeEnum = new Enum(
	// Elements:
	"Header",
	"Paragraph",

	// Inline elements:
	"Emoji",
	"Emphasis",
	"Strong",
	"StrongEmphasis",
	"Code",
	"Strikethrough",
)

export default typeEnum
