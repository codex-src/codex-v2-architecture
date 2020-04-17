import Editor from "Editor2/Editor"
import keyCodes from "Editor2/keyCodes"
import raw from "raw.macro"
import React from "react"
import useEditor from "Editor2/useEditor"

import "./App.css"

const LOCALSTORAGE_KEY = "codex-app-v2.3"

// Read from localStorage:
const initialValue = (() => {
	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
	if (!cache) {
		return raw("./App.md")
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return raw("./App.md")
	}
	return json.data
})()

const App = () => {
	// const [state, setState] = useEditor(`> Hello`)
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

	// Binds read-only shortcut.
	React.useEffect(
		React.useCallback(() => {
			const handler = e => {
				if (!e.metaKey || e.keyCode !== keyCodes.P) {
					// No-op
					return
				}
				e.preventDefault()
				setState(current => ({
					...current,
					readOnly: !state.readOnly,
				}))
			}
			document.addEventListener("keydown", handler)
			return () => {
				document.removeEventListener("keydown", handler)
			}
		}, [state, setState]),
		[state.readOnly],
	)

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">

				<Editor
					tag="article"
					id="main-editor"
					// className="text-lg"
					style={{ fontSize: 17 }}
					state={state}
					setState={setState}
					// readOnly
				/>

			</div>
		</div>
	)
}

export default App
