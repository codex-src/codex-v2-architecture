import React from "react"
import { toText } from "Editor/Elements/cmap"

// Shorthand.
function format(n) {
	return n.toLocaleString("en")
}

// Computes the LHS status string.
function computeStatusLHS(editorState) {
	const statusLHS = ((chars, lines) => {
		if (!editorState.focused) {
			return "No selection"
		}
		if (editorState.pos1.pos === editorState.pos2.pos) {
			return `Line ${format(editorState.pos1.y + 1)}, column ${format(editorState.pos1.x + 1)}`
		} else {
			return `Selected ${lines < 2 ? "" : `${format(lines)} lines, `}${format(chars)} character${chars === 1 ? "" : "s"}`
		}
	})(editorState.pos2.pos - editorState.pos1.pos, editorState.pos2.y - editorState.pos1.y + 1)
	return statusLHS
}

// Computes the RHS status string.
function computeStatusRHS(editorState) {
	const str = toText(editorState.elements)
	const metadata = {
		words: str.split(/\s+/).filter(Boolean).length,
		minutes: Math.round([...str].length / 4.7 / 300), // Characters per word / words per minute
	}
	const statusRHS = ((words, minutes) => {
		return `${format(words)} word${words === 1 ? "" : "s"}${!minutes ? "" : `, est. ${format(minutes)} minute read`}`
	})(metadata.words, metadata.minutes)
	return statusRHS
}

function useStatusBars(editorState) {
	const [statusLHS, setStatusLHS] = React.useState("")
	const [statusRHS, setStatusRHS] = React.useState("")

	React.useEffect(() => {
		const statusLHS = computeStatusLHS(editorState)
		setStatusLHS(statusLHS)
	}, [editorState])

	React.useEffect(() => {
		const id = setTimeout(() => {
			const statusRHS = computeStatusRHS(editorState)
			setStatusRHS(statusRHS)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState])

	return [statusLHS, statusRHS]
}

export default useStatusBars
