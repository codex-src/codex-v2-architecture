import React from "react"
import { LOCALSTORAGE_KEY } from "./constants"
import { NumberEnum } from "lib/Enum"

const saveStatusEnum = new NumberEnum(
	"Unsaved",
	"Saving",
	"Saved_before",
	"Saved_after",
)

function useSaveStatus(editorState) {
	const [saveStatus, setSaveStatus] = React.useState(saveStatusEnum.Unsaved)

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
				setSaveStatus(saveStatusEnum.Saved_before)
				const id = setTimeout(() => {
					setSaveStatus(saveStatusEnum.Saved_after)
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
