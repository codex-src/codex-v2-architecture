import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"

import {
	toHTML,
	toHTML__BEM,
	toReact_js,
} from "Editor2/cmap"

const initialState = {
	show: false,
	renderMode: renderModesEnum.JSON,
	extension: "json",
	// [renderModesEnum.JSON]: "",
	// [renderModesEnum.HTML]: "",
	// [renderModesEnum.HTML__BEM]: "",
	// [renderModesEnum.React_js]: "",
	...renderModesEnum.keys().reduce((acc, each) => {
		acc[each] = ""
		return acc
	}, {}),
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

function useEditorSettings() {
	return useMethods(methods, initialState)
}

export default useEditorSettings
