import Editor from "Editor2/Editor"
import React from "react"
import useEditor from "Editor2/useEditor"

const App = () => {
	const [state, setState] = useEditor(`Hello! A

Hello! B

Hello! C

Hello! D

Hello! E`)

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">
				<Editor state={state} setState={setState} />
			</div>
		</div>
	)
}

export default App
