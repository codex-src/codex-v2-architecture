import React from "react"
import useEditorState from "./useEditorState"

// Gets syntax from a string or an array of strings.
function getSyntax(syntax) {
	let startSyntax = ""
	let endSyntax = ""
	if (syntax === null) {
		// No-op
	} else if (typeof syntax === "string") {
		startSyntax = syntax
		endSyntax = syntax
	} else if (Array.isArray(syntax)) {
		startSyntax = syntax[0]
		if (syntax.length === 2) {
			endSyntax = syntax[1]
		}
	}
	return [startSyntax, endSyntax]
}

const Syntax = props => {
	const [state] = useEditorState()
	if (!props.children || state.readOnly) {
		return null
	}
	// NOTE: props.className doesn’t concatenate
	return <span className="text-md-blue-a400" {...props} />
}

const Markdown = ({ syntax, ...props }) => {
	const [startSyntax, endSyntax] = getSyntax(syntax)
	return (
		<React.Fragment>

			{/* LHS */}
			<Syntax {...props}>
				{startSyntax}
			</Syntax>

			{/* RHS */}
			{props.children}
			<Syntax {...props}>
				{endSyntax}
			</Syntax>

		</React.Fragment>
	)
}

export default Markdown
