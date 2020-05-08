import React from "react"
import { LOCALSTORAGE_KEY } from "./constants"

// 0 - Unsaved
// 1 - Saving
// 2 - Saved (before)
// 3 - Saved (after)
//
// TODO: Add NumberEnum pattern
function useSaveStatus(editorState) {
	const [saveStatus, setSaveStatus] = React.useState(0)

	const mounted = React.useRef()
	React.useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		const ids = []
		const id = setTimeout(() => {
			const json = JSON.stringify({ data: editorState.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
			const id = setTimeout(() => {
				setSaveStatus(2)
				const id = setTimeout(() => {
					setSaveStatus(3)
				}, 1e3)
				ids.push(id)
			}, 500)
			ids.push(id)
		}, 100)
		ids.push(id)
		return () => {
			[...ids].reverse().map(each => clearTimeout(each))
		}
	}, [editorState.data])

	return saveStatus
}

export default useSaveStatus
