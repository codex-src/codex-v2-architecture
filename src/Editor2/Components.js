import React from "react"
import typeMap from "./typeMap"

import {
	// Multiline,
	Paragraph,
} from "./HOC"

// Parses an array of parsed data structures to renderable
// React components.
function toReact(parsed) {
	const recurse = toReact

	if (parsed === null || typeof parsed === "string") {
		return parsed
	}
	const components = []
	for (const each of parsed) {
		if (each === null || typeof each === "string") {
			components.push(recurse(each))
			continue
		}
		const { type: T, ...props } = each
		components.push(React.createElement(typeMap[T], {
			key: components.length,
			...props,
		}, recurse(props.parsed)))
	}
	return components
}

// TODO: parseReact
export const P = ({ id, parsed }) => (
	<Paragraph id={id}>
		{toReact(parsed) || (
			<br />
		)}
	</Paragraph>
)
