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
		show: false,
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
		state.show = true
		state.renderMode = renderModesEnum.Readme
		state.extension = ""
	},
	showJSON() {
		state.show = true
		state.renderMode = renderModesEnum.JSON
		state.extension = "json"
	},
	showHTML() {
		state.show = true
		state.renderMode = renderModesEnum.HTML
		state.extension = "html"
	},
	showHTML__BEM() {
		state.show = true
		state.renderMode = renderModesEnum.HTML__BEM
		state.extension = "html"
	},
	showReact_js() {
		state.show = true
		state.renderMode = renderModesEnum.React_js
		state.extension = "jsx"
	},
	toggleShow() {
		state.show = !state.show
	},
})

function useEditorSettings(defaultRenderer) {
	return useMethods(methods, {}, () => initialState(defaultRenderer))
}

export default useEditorSettings
