import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"

import {
	toHTML,
	toReact_js,
} from "Editor2/cmap"

// Maps renderModesEnum to language extensions.
const extMap = {
	[renderModesEnum.JSON]: "json",
	[renderModesEnum.HTML]: "html",
}

function initialState(defaultRenderer) {
	const state = {
		readOnly: false,
		showSidebar: false,
		fontSize: 17,
		renderMode: renderModesEnum[defaultRenderer],
		extension: extMap[defaultRenderer] || "",
		[renderModesEnum.JSON]: "",
		[renderModesEnum.HTML]: "",
		[renderModesEnum.React_js]: "",
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
			[renderModesEnum.React_js]: toReact_js(editorState.reactVDOM),
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
	showReact_js() {
		if (!state.showSidebar) {
			state.showSidebar = true
		} else if (state.renderMode === renderModesEnum.React_js) {
			state.showSidebar = false
		}
		state.renderMode = renderModesEnum.React_js
		state.extension = "html"
	},
	toggleReadOnly() {
		state.readOnly = !state.readOnly
	},
	toggleSidebar() {
		state.showSidebar = !state.showSidebar
	},
	zoomOut() {
		if (state.fontSize <= 13) {
			// No-op
			return
		}
		// state.fontSize *= 0.9
		state.fontSize -= 2
	},
	zoomIn() {
		if (state.fontSize >= 21) {
			// No-op
			return
		}
		// state.fontSize *= 1.1
		state.fontSize += 2
	},
})

function useEditorPreferences(defaultRenderer) {
	return useMethods(methods, {}, () => initialState(defaultRenderer))
}

export default useEditorPreferences
