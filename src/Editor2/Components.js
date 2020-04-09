import React from "react"
import typeMap from "./typeMap"

import {
	// Multiline,
	Paragraph,
} from "./HOC"

// Parses an array of data structures (objects) to React
// components.
function toReact(children) {
	const recurse = toReact

	if (children === null || typeof children === "string") {
		return children
	}
	const components = []
	for (const each of children) {
		if (each === null || typeof each === "string") {
			components.push(recurse(each))
			continue
		}
		const { type: T, ...props } = each
		components.push(React.createElement(typeMap[T], {
			key: components.length,
			...props,
		}, recurse(props.children)))
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
