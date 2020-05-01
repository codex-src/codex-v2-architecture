import React from "react"
import { toText } from "Editor/cmap"

function useTitle(editorState) {
	const [title, setTitle] = React.useState(() => toText(editorState.reactVDOM.slice(0, 1)).split("\n", 1)[0])

	React.useEffect(() => {
		const id = setTimeout(() => {
			const title = toText(editorState.reactVDOM.slice(0, 1)).split("\n", 1)[0]
			setTitle(title)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState])

	return [title, setTitle]
}

export default useTitle
