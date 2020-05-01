import Editor from "Editor/Editor"
import raw from "raw.macro"
import React from "react"
import useEditor from "Editor/useEditor"

const ReadmeEditor = ({ readOnly }) => {
	const [state, dispatch] = useEditor(raw("./Readme.md"))
	return <Editor style={{ fontSize: 15 }} state={state} dispatch={dispatch} readOnly={readOnly} />
}

export default ReadmeEditor
