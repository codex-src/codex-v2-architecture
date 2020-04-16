import Markdown from "./Markdown"
import React from "react"
import typeMap from "./typeMap"

import {
	// Node,
	Root,
} from "./HOC"

// Converts a parsed data structure (children) to renderable
// React components.
function toReact(children) {
	if (children === null || typeof children === "string") {
		return children
	}
	const components = []
	for (const each of children) {
		if (each === null || typeof each === "string") {
			components.push(toReact(each))
			continue
		}
		const { type: T, ...props } = each
		components.push(React.createElement(typeMap[T], {
			key: components.length,
			...props,
		}, toReact(props.children)))
	}
	return components
}

// Trims extraneous spaces.
function trim(str) {
	return str.replace(/ +/, " ") // Trims extra spaces
}

const headerClassNames = {
	h1: trim("font-medium   text-3xl leading-tight"),
	h2: trim("font-medium   text-2xl leading-tight"),
	h3: trim("font-semibold text-xl  leading-tight"),
	h4: trim("font-semibold text-xl  leading-tight"),
	h5: trim("font-semibold text-xl  leading-tight"),
	h6: trim("font-semibold text-xl  leading-tight"),
}

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<Root id={id} className={headerClassNames[tag]}>
		{/* NOTE: Use className="block" because of
		contenteditable */}
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(children) || (
					<br />
				)}
			</Markdown>
		</a>
	</Root>
))

export const Paragraph = ({ id, children }) => (
	<Root id={id}>
		{toReact(children) || (
			<br />
		)}
	</Root>
)
