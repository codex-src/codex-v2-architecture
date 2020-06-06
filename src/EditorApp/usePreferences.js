import useMethods from "use-methods"
import { StringEnum } from "lib/Enums"
import { toHTML } from "Editor/Elements/cmap"

const defaultFontSize = 17

const renderModesEnum = new StringEnum(
	"Readme",
	"Text",
	"HTML",
	"React_js",
	"JSON",
)

// const text = `<!--
// You can easily export your Codex to use anywhere.
//
// <div class="codex-output">
// 	...
// </div>
//
// .codex-output {
// 	...
// }
//
// See https://codepen.io/zaydek/pen/VwLoOWK for example.
// -->
// `

const methods = state => ({
	// Updates renderers.
	update(editorState) {
		state.output[renderModesEnum.HTML] = toHTML(editorState.elements)
	},
	// TODO: Remove
	toggleReadOnly() {
		state.readOnly = !state.readOnly
	},
	toggleOutline() {
		state.showOutline = !state.showOutline
	},
	toggleSidebar() {
		state.showSidebar = !state.showSidebar
	},
	// showHTML() {
	// 	if (!state.showSidebar) {
	// 		state.showSidebar = true
	// 	} else if (state.renderMode === renderModesEnum.HTML) {
	// 		state.showSidebar = false
	// 	}
	// 	state.renderMode = renderModesEnum.HTML
	// 	state.output.extension = "html"
	// },
	zoomIn() {
		if (state.fontSize >= defaultFontSize + 6) {
			// No-op
			return
		}
		state.fontSize += 2
	},
	zoomOut() {
		if (state.fontSize <= defaultFontSize - 4) {
			// No-op
			return
		}
		state.fontSize -= 2
	},
	// resetZoom() {
	// 	state.fontSize = defaultFontSize
	// },
})

function usePreferences(editorState) {
	const [state, dispatch] = useMethods(methods, {}, () => ({
		readOnly: false, // TODO: Remove

		showOutline: true,                 // Show outline?
		showSidebar: false,                // Show sidebar?
		fontSize: defaultFontSize,         // Editor font-size
		renderMode: renderModesEnum.HTML,  // Render mode
		output: {                          //
			[renderModesEnum.HTML]: "",      // HTML output
			extension: "html",               // Renderer extension
		}
	}))
	return [state, dispatch]
}

export default usePreferences
