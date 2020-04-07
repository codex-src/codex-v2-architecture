import Enum from "../Enum"

const RenderModes = new Enum(
	"Text", // Plain text
	"GFM",  // GitHub Flavored Markdown
	"HTML", // HTML (string)
)

export default RenderModes
