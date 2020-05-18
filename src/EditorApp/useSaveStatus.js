import React from "react"
import { LOCALSTORAGE_KEY } from "./constants"
import { NumberEnum } from "lib/Enums"

const saveStatusEnum = new NumberEnum(
	"Unsaved",
	"Saving",
	"Saved",
	"Saved_hidden",
)

function useSaveStatus(editorState) {
	const [saveStatus, setSaveStatus] = React.useState(saveStatusEnum.Unsaved)

	// const mounted = React.useRef()
	// React.useEffect(() => {
	// 	if (!mounted.current) {
	// 		mounted.current = true
	// 		return
	// 	}
	// 	// NOTE: Use unshift not push because clearTimeout needs
	// 	// to clear in reverse-order
	// 	const ids = []
	// 	const id = setTimeout(() => {
	// 		const json = JSON.stringify({ data: editorState.data })
	// 		localStorage.setItem(LOCALSTORAGE_KEY, json)
	// 		const id = setTimeout(() => {
	// 			setSaveStatus(saveStatusEnum.Saved)
	// 			const id = setTimeout(() => {
	// 				setSaveStatus(saveStatusEnum.Saved_hidden)
	// 			}, 1e3)
	// 			ids.unshift(id)
	// 		}, 500)
	// 		ids.unshift(id)
	// 	}, 100)
	// 	ids.unshift(id)
	// 	return () => {
	// 		for (const id of ids) {
	// 			clearTimeout(id)
	// 		}
	// 	}
	// }, [editorState.data])

	return saveStatus
}

export default useSaveStatus
