import React from "react"

import {
	Root,
} from "./HOC"

// Parses an array of parsed data structures to renderable
// React components.
function toReact(parsed: string): React.ReactNode {
	const recurse = toReact

	if (parsed === null || typeof parsed === "string") {
		return parsed
	}
	// const components = []
	// for (const each of parsed) {
	// 	if (each === null || typeof each === "string") {
	// 		components.push(recurse(each))
	// 		continue
	// 	}
	// 	const { type: T, ...props } = each
	// 	components.push(React.createElement(typeMap[T], {
	// 		key: components.length,
	// 		...props,
	// 	}, recurse(props.parsed)))
	// }
	// return components

	return "TODO"
}

type ParagraphProps = {
	id:     string,
	raw:    string,
	parsed: string, // React.ReactNode,
}

export const Paragraph = ({ id, parsed }: ParagraphProps) => (
	<Root id={id}>
		{toReact(parsed) || (
			<br />
		)}
	</Root>
)
