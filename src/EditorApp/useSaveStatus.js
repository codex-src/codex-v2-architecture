import React from "react"
import timeout from "timeout"
import { LOCALSTORAGE_KEY } from "./constants"

// 0 - Unsaved
// 1 - Saving
// 2 - Saved (before)
// 3 - Saved (after)
//
function useSaveStatus(editorState) {
	const [saveStatus, setSaveStatus] = React.useState(0)

	const mounted = React.useRef()
	React.useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		setSaveStatus(1)
		const save = async () => {
			const json = JSON.stringify({ data: editorState.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
			await timeout(500)
			setSaveStatus(current => current + 1)
			await timeout(100)
			setSaveStatus(current => current + 1)
		}
		const id = setTimeout(save, 100)
		return () => {
			clearTimeout(id)
		}
	}, [editorState.data])

	return [saveStatus, setSaveStatus]
}

export default useSaveStatus
