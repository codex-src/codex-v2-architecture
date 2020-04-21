import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"

import {
	toHTML,
	toHTML__BEM,
	toReact_js,
	toText,
} from "Editor2/cmap"

// Maps render modes to an language extension.
const extensionMap = {
	[renderModesEnum.Readme]: "", // FIXME?
	[renderModesEnum.Text]: "",
	[renderModesEnum.JSON]: "json",
	[renderModesEnum.HTML]: "html",
	[renderModesEnum.HTML__BEM]: "html",
	[renderModesEnum.React_js]: "jsx",
}

function initialState(defaultRenderer) {
	const state = {
		metadata: {
			title: "",
			runes: 0,
			words: 0,
			minutes: 0,
		},
		showReadOnly: false,
		showCSSDebugger: false,
		showSidebar: false,
		renderMode: renderModesEnum[defaultRenderer],
		extension: extensionMap[defaultRenderer],
		[renderModesEnum.Text]: "",
		[renderModesEnum.JSON]: "",
		[renderModesEnum.HTML]: "",
		[renderModesEnum.HTML__BEM]: "",
		[renderModesEnum.React_js]: "",
	}
	return state
}

const CHARACTERS_PER_WORD =   4.7 // eslint-disable-line no-multi-spaces
const WORDS_PER_MINUTE    = 300.0 // eslint-disable-line no-multi-spaces

// Parses metadata from a text-representation of an editor.
function parseMetadata(text) {
	const runes = [...text].length
	const metadata = {
		title: text.split("\n", 1)[0],
		runes,
		words: text.split(/\s+/).filter(Boolean).length,
		minutes: Math.round(runes / CHARACTERS_PER_WORD / WORDS_PER_MINUTE),
	}
	return metadata
}

const methods = state => ({
	// Shallowly updates settings; updates text and metadata.
	shallowUpdate(editorState) {
		const text = toText(editorState.reactVDOM)
		Object.assign(state, {
			metadata: parseMetadata(text),
			[renderModesEnum.Text]: text,
		})
	},
	// Updates settings.
	update(editorState) {
		// this.shallowUpdate(editorState)
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
			[renderModesEnum.HTML]:      toHTML(editorState.reactVDOM),
			[renderModesEnum.HTML__BEM]: toHTML__BEM(editorState.reactVDOM),
			[renderModesEnum.React_js]:  toReact_js(editorState.reactVDOM),
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
	toggleSidebar() {
		state.showSidebar = !state.showSidebar
	},
})

function useEditorSettings(defaultRenderer) {
	return useMethods(methods, {}, () => initialState(defaultRenderer))
}

export default useEditorSettings
