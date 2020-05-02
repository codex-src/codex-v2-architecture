import React from "react"
import { toText } from "Editor/cmap"

// Shorthand.
function format(n) {
	return n.toLocaleString("en")
}

// Computes the LHS status string.
function computeStatusLHS(editorState) {
	const lhs = ((chars, lines) => {
		if (editorState.pos1.pos === editorState.pos2.pos) {
			return `Line ${format(editorState.pos1.y + 1)}, column ${format(editorState.pos1.x + 1)}`
		} else {
			return `Selected ${lines < 2 ? "" : `${format(lines)} lines, `}${format(chars)} character${chars === 1 ? "" : "s"}`
		}
	})(editorState.pos2.pos - editorState.pos1.pos, editorState.pos2.y - editorState.pos1.y + 1)
	return lhs
}

// Computes the RHS status string.
function computeStatusRHS(editorState) {
	const str = toText(editorState.reactVDOM)
	const metadata = {
		words: str.split(/\s+/).filter(Boolean).length,
		minutes: Math.round([...str].length / 4.7 / 300), // Characters per word / words per minute
	}
	const rhs = ((words, minutes) => {
		return `${format(words)} word${words === 1 ? "" : "s"}${!minutes ? "" : `, est. ${format(minutes)} minute read`}`
	})(metadata.words, metadata.minutes)
	return rhs
}

function useStatusBars(editorState) {
	const [lhs, setLHS] = React.useState(() => computeStatusLHS(editorState))
	const [rhs, setRHS] = React.useState(() => computeStatusRHS(editorState))

	React.useEffect(() => {
		const lhs = computeStatusLHS(editorState)
		setLHS(lhs)
	}, [editorState])

	React.useEffect(() => {
		const id = setTimeout(() => {
			const rhs = computeStatusRHS(editorState)
			setRHS(rhs)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState])

	return [[lhs, rhs], [setLHS, setRHS]]
}

export default useStatusBars
