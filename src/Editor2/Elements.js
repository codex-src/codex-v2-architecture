import Markdown from "./Markdown"
import React from "react"
import TypeMap from "./TypeMap"

import {
	// Node,
	Root,
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
		components.push(React.createElement(TypeMap[T], {
			key: components.length,
			...props,
		}, recurse(props.parsed)))
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

export const Header = React.memo(({ tag, id, syntax, hash, parsed }) => (
	<Root id={id} className={headerClassNames[tag]}>
		{/* NOTE: Use block because of contenteditable */}
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(parsed) || (
					<br />
				)}
			</Markdown>
		</a>
	</Root>
))

export const P = ({ id, parsed }) => (
	<Root id={id}>
		{toReact(parsed) || (
			<br />
		)}
	</Root>
)
