import Editor from "Editor3/Editor"
import React from "react"
import useEditor from "Editor3/useEditor"

const App = () => {
	const [state, setState] = useEditor("hello\n\n# hello\n\nhello")

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">
				<Editor
					state={state}
					setState={setState}
				/>
			</div>
		</div>
	)
}

export default App
