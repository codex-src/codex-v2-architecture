import React from "react"

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
	return <span className={`markdown ${className || ""}`.trim()} {...props} />
}

const Markdown = ({ syntax, ...props }) => {
	const [syntax1, syntax2] = parseSyntax(syntax)
	return (
		<React.Fragment>

			{/* NOTE: Do not use syntax && ( ... ); use
			Boolean(syntax) creating revent empty text nodes */}

			{/* LHS */}
			{Boolean(syntax1) && (
				<Syntax {...props}>
					{syntax1}
				</Syntax>
			)}

			{props.children}

			{/* RHS */}
			{Boolean(syntax2) && (
				<Syntax {...props}>
					{syntax2}
				</Syntax>
			)}

		</React.Fragment>
	)
}

export default Markdown
