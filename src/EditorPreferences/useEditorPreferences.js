import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"

import {
	toHTML,
	toReact_js,
} from "Editor/cmap"

const defaultFontSize = 17

function initialState(defaultRenderer) {
	const state = {
		readOnly: false,
		showSidebar: false,
		fontSize: defaultFontSize,
		renderMode: renderModesEnum[defaultRenderer],
		extension: "",
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
		state.extension = "jsx"
	},
	toggleReadOnly() {
		state.readOnly = !state.readOnly
	},
	toggleSidebar() {
		state.showSidebar = !state.showSidebar
	},
	zoomOut() {
		if (state.fontSize <= defaultFontSize - 2) {
			// No-op
			return
		}
		state.fontSize -= 2
	},
	zoomIn() {
		if (state.fontSize >= defaultFontSize + 2) {
			// No-op
			return
		}
		state.fontSize += 2
	},
	resetZoom() {
		state.fontSize = defaultFontSize
	},
})

function useEditorPreferences(defaultRenderer) {
	return useMethods(methods, {}, () => initialState(defaultRenderer))
}

export default useEditorPreferences
