import Enum from "../Enum"

const RenderModes = new Enum(
	// Text
	"Text",
	"GFM",
	// HTML
	"HTML",
	"HTML__BEM",
	// JavaScript
	"Alpine_js",  // HTML?
	"Angular_js", // HTML?
	"React_js",   // JSX
	"Svelte_js",  // May be implicitly HTML
	"Vue_js",     // May be implicitly HTML
)

export default RenderModes
