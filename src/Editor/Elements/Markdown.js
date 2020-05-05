import React from "react"
import useEditorState from "../useEditorState"

// Parses syntax from a string or array of strings to an
// array of strings.
function parseSyntax(syntax) {
	let s1 = ""
	let s2 = ""
	if (syntax === null) {
		// No-op; defer to end
	} else if (typeof syntax === "string") {
		s1 = syntax
		s2 = syntax
	} else if (Array.isArray(syntax)) {
		s1 = syntax[0]
		if (syntax.length === 2) {
			s2 = syntax[1]
		}
	}
	return [s1, s2]
}

const Syntax = ({ className, ...props }) => {
	const [{ readOnly }] = useEditorState()
	if (!props.children || readOnly) {
		return null
	}
	return <span className={className === undefined ? "text-md-blue-a400" : className} {...props} />
}

const Markdown = ({ syntax, ...props }) => {
	const [syntax1, syntax2] = parseSyntax(syntax)
	return (
		<React.Fragment>

			{/* LHS */}
			<Syntax {...props}>
				{syntax1}
			</Syntax>

			{/* RHS */}
			{props.children}
			<Syntax {...props}>
				{syntax2}
			</Syntax>

		</React.Fragment>
	)
}

export default Markdown