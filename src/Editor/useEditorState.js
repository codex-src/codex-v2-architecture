import EditorContext from "./EditorContext"
import React from "react"

function useEditorState() {
	return React.useContext(EditorContext)
}

export default useEditorState
