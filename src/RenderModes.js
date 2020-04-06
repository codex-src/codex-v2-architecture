import Enum from "./Enum"

const RenderModes = new Enum(
	"Text", // Plain text
	"GFM",  // GitHub Flavored Markdown
	"HTML", // HTML (string)
	// "JSON", // JSON (string)
)

export default RenderModes
