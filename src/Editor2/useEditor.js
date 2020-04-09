import React from "react"
import Type from "./EnumType"

function useEditor(initialValue, options = null) {
	const [state, setState] = React.useState(() => ({
		// TODO: Add <Paragraph> parser
		data: [
			{
				type: Type.P,
				id: "abc-123-xyz",
				data: "Hello, world!",
			},
		],
		pos1: {
			id: "",
			offset: "",
		},
		pos2: {
			id: "",
			offset: "",
		},
	}))
	return [state, setState]
}

export default useEditor
