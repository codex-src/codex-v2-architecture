import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"
import { toHTML } from "Editor2/cmap"

// Maps renderModesEnum to language extensions.
const extMap = {
	[renderModesEnum.JSON]: "json",
	[renderModesEnum.HTML]: "html",
}

function initialState(defaultRenderer) {
	const state = {
		readOnly: false,
		showSidebar: false,
		renderMode: renderModesEnum[defaultRenderer],
		extension: extMap[defaultRenderer] || "",
		[renderModesEnum.JSON]: "",
		[renderModesEnum.HTML]: "",
	}
	return state
}

const methods = state => ({
	// Updates preferences.
	update(editorState) {
		Object.assign(state, {
			[renderModesEnum.JSON]: JSON.stringify(
				{
					...editorState,
					data:      undefined,
					history:   undefined,
					reactVDOM: undefined,
					reactDOM:  undefined,
				},
				null,
				"\t",
			),
			[renderModesEnum.HTML]: toHTML(editorState.reactVDOM),
		})
	},
	showReadme() {
		if (!state.showSidebar) {
			state.showSidebar = true
		} else if (state.renderMode === renderModesEnum.Readme) {
			state.showSidebar = false
		}
		state.renderMode = renderModesEnum.Readme
		state.extension = ""
	},
	showJSON() {
		if (!state.showSidebar) {
			state.showSidebar = true
		} else if (state.renderMode === renderModesEnum.JSON) {
			state.showSidebar = false
		}
		state.renderMode = renderModesEnum.JSON
		state.extension = "json"
	},
	showHTML() {
		if (!state.showSidebar) {
			state.showSidebar = true
		} else if (state.renderMode === renderModesEnum.HTML) {
			state.showSidebar = false
		}
		state.renderMode = renderModesEnum.HTML
		state.extension = "html"
	},
	toggleReadOnly() {
		state.readOnly = !state.readOnly
	},
	toggleSidebar() {
		state.showSidebar = !state.showSidebar
	},
})

function useEditorPreferences(defaultRenderer) {
	return useMethods(methods, {}, () => initialState(defaultRenderer))
}

export default useEditorPreferences
