import React from "react"
import useEditorSetState from "./useEditorSetState"

// Gets syntax from a string or an array of strings.
function getSyntax(syntax: string | string[]): string[] {
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

type SyntaxProps = {
	className?: string,
	style?: React.CSSProperties,
	children?: React.ReactNode,
}

const Syntax = (props: SyntaxProps): null | React.ReactElement => {
	// NOTE: Use ! to assert [state, setState]
	const [state] = useEditorSetState()!
	if (!props.children || state.readOnly) {
		return null
	}
	// NOTE: props.className does **not** concatenate
	return <span className="text-md-blue-a400" {...props} />
}

type MarkdownProps = {
	syntax: string | string[],
	className?: string,
	style?: React.CSSProperties,
	children?: React.ReactNode,
}

const Markdown = ({ syntax, ...props }: MarkdownProps): React.ReactElement => {
	const [s1, s2] = getSyntax(syntax)
	return (
		<React.Fragment>

			{/* LHS */}
			<Syntax {...props}>
				{s1}
			</Syntax>

			{/* RHS */}
			{props.children}
			<Syntax {...props}>
				{s2}
			</Syntax>

		</React.Fragment>
	)
}

export default Markdown
