import Editor from "Editor3/Editor"
import React from "react"
import useEditor from "Editor3/useEditor"

import "./App.css"

// NOTE: raw.macro does not have type definitions
const raw = require("raw.macro")

const LOCALSTORAGE_KEY = "codex-app-v2.3"

// Read from localStorage:
const initialValue = (() => {
	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
	if (!cache) {
		return raw("./App3.md")
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return raw("./App3.md")
	}
	return json.data
})()

const App = () => {
	const [state, setState] = useEditor(initialValue)

	// Write to localStorage:
	React.useEffect(() => {
		const id = setTimeout(() => {
			const data = state.data.map(each => each.raw).join("\n")
			localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ data }))
		}, 100)
		return () => {
			clearTimeout(id)
		}
	}, [state.data])

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
