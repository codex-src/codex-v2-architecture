import React from "react"
import typeEnum from "Editor/Elements/typeEnum"
import { toInnerText } from "Editor/Elements/cmap"

// Computes an outline. <h1> and <h2> elements are
// considered primary headers; <h3> through <h6> are
// considered secondary headers.
function computeOutline(editorState) {
	const outline = []
	const headers = editorState.reactVDOM.slice(1).filter(each => each.type === typeEnum.Header)
	for (const { tag, id, hash, children } of headers) {
		switch (tag) {
		case "h1":
		case "h2":
			outline.push({
				id,
				hash,
				secondary: [],
				children: toInnerText(children),
			})
			break
		case "h3":
		case "h4":
		case "h5":
		case "h6":
			if (!outline.length || !outline[outline.length - 1].secondary) {
				outline.push({
					id: "",
					hash: "",
					secondary: [],
					children: "",
				})
			}
			outline[outline.length - 1].secondary.push({
				id,
				hash,
				children: toInnerText(children),
			})
			break
		default:
			// No-op
			break
		}
	}
	return outline
}

function useOutline(editorState) {
	const [outline, setOutline] = React.useState(() => computeOutline(editorState))

	React.useEffect(() => {
		const id = setTimeout(() => {
			const outline = computeOutline(editorState)
			setOutline(outline)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState])

	return [outline, setOutline]
}

export default useOutline
