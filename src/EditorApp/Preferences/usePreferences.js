import React from "react"
import renderModesEnum from "./renderModesEnum"
import useMethods from "use-methods"

import {
	// toReact_js,
	toHTML,
} from "Editor/Elements/cmap"

const defaultFontSize = 17

function initialState(defaultRenderer) {
	const state = {
		readOnly: false,
		showSidebar: false,
		fontSize: defaultFontSize,
		renderMode: renderModesEnum[defaultRenderer],
		extension: "html",
		[renderModesEnum.HTML]: "",
		// [renderModesEnum.React_js]: "",
		// [renderModesEnum.JSON]: "",
	}
	return state
}

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
	// Updates preferences.
	update(editorState) {
		Object.assign(state, {
			// TODO: Add { highlighted } option
			[renderModesEnum.HTML]: toHTML(editorState.elements),
			// [renderModesEnum.React_js]: toReact_js(editorState.elements),
			// [renderModesEnum.JSON]: JSON.stringify(
			// 	{
			// 		...editorState,
			// 		data:           undefined,
			// 		extPosRange:    undefined,
			// 		history:        undefined,
			// 		cachedElements: undefined,
			// 		elements:       undefined,
			// 		reactDOM:       undefined,
			// 	},
			// 	null,
			// 	"\t",
			// ),
		})
	},
	// showReadme() {
	// 	if (!state.showSidebar) {
	// 		state.showSidebar = true
	// 	} else if (state.renderMode === renderModesEnum.Readme) {
	// 		state.showSidebar = false
	// 	}
	// 	state.renderMode = renderModesEnum.Readme
	// 	state.extension = ""
	// },
	showHTML() {
		if (!state.showSidebar) {
			state.showSidebar = true
		} else if (state.renderMode === renderModesEnum.HTML) {
			state.showSidebar = false
		}
		state.renderMode = renderModesEnum.HTML
		state.extension = "html"
	},
	// showReact_js() {
	// 	if (!state.showSidebar) {
	// 		state.showSidebar = true
	// 	} else if (state.renderMode === renderModesEnum.React_js) {
	// 		state.showSidebar = false
	// 	}
	// 	state.renderMode = renderModesEnum.React_js
	// 	state.extension = "jsx"
	// },
	// showJSON() {
	// 	if (!state.showSidebar) {
	// 		state.showSidebar = true
	// 	} else if (state.renderMode === renderModesEnum.JSON) {
	// 		state.showSidebar = false
	// 	}
	// 	state.renderMode = renderModesEnum.JSON
	// 	state.extension = "json"
	// },
	toggleReadOnly() {
		state.readOnly = !state.readOnly
	},
	toggleSidebar() {
		state.showSidebar = !state.showSidebar
	},
	zoomIn() {
		if (state.fontSize >= defaultFontSize + 8) {
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

function usePreferences(editorState, options = { defaultRenderer: renderModesEnum.HTML }) {
	const [state, dispatch] = useMethods(methods, {}, () => initialState(options.defaultRenderer))

	const mounted = React.useRef()
	React.useLayoutEffect(
		React.useCallback(() => {
			if (mounted.current) {
				// No-op
				return
			}
			mounted.current = true
			dispatch.update(editorState)
		}, [editorState, dispatch]),
		[],
	)

	return [state, dispatch]
}

export default usePreferences
