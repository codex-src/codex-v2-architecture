import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"

import {
	toHTML,
	toHTML__BEM,
	toReact_js,
} from "Editor2/cmap"

// Maps render modes to an language extension.
const extensionMap = {
	[renderModesEnum.Readme]: "",
	[renderModesEnum.JSON]: "json",
	[renderModesEnum.HTML]: "html",
	[renderModesEnum.HTML__BEM]: "html",
	[renderModesEnum.React_js]: "jsx",
}

function initialState(defaultRenderer) {
	const state = {
		showReadOnly: false,
		showCSSDebugger: false,
		showSidebar: false,
		renderMode: renderModesEnum[defaultRenderer],
		extension: extensionMap[defaultRenderer],
		[renderModesEnum.JSON]: "",
		[renderModesEnum.HTML]: "",
		[renderModesEnum.HTML__BEM]: "",
		[renderModesEnum.React_js]: "",
	}
	return state
}

const methods = state => ({
	update(editorState) {
		Object.assign(state, {
			JSON: JSON.stringify(
				{
					...editorState,
					data:      undefined,
					reactVDOM: undefined,
					reactDOM:  undefined,
				},
				null,
				"\t",
			),
			HTML:      toHTML(editorState.reactVDOM),
			HTML__BEM: toHTML__BEM(editorState.reactVDOM),
			React_js:  toReact_js(editorState.reactVDOM),
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
	showHTML__BEM() {
		if (!state.showSidebar) {
			state.showSidebar = true
		} else if (state.renderMode === renderModesEnum.HTML__BEM) {
			state.showSidebar = false
		}
		state.renderMode = renderModesEnum.HTML__BEM
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
		state.showReadOnly = !state.showReadOnly
	},
	toggleCSSDebugger() {
		state.showCSSDebugger = !state.showCSSDebugger
	},
	// toggleSidebar() {
	// 	state.showSidebar = !state.showSidebar
	// },
})

function useEditorSettings(defaultRenderer) {
	return useMethods(methods, {}, () => initialState(defaultRenderer))
}

export default useEditorSettings
