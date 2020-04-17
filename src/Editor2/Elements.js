import Markdown from "./Markdown"
import React from "react"
import typeMap from "./typeMap"
import useEditorSetState from "./useEditorSetState"

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
	return str.replace(/ +/g, " ")
}

const headerClassNames = {
	h1: trim("font-medium   text-2xl leading-tight"),
	h2: trim("font-medium   text-xl  leading-tight"),
	h3: trim("font-semibold text-lg  leading-tight"),
	h4: trim("font-semibold text-lg  leading-tight"),
	h5: trim("font-semibold text-lg  leading-tight"),
	h6: trim("font-semibold text-lg  leading-tight"),
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

export const Paragraph = React.memo(({ id, emojis, children }) => (
	<Root id={id} className={!emojis ? null : `emojis emojis-${emojis}`}>
		{toReact(children) || (
			<br />
		)}
	</Root>
))

export const Break = React.memo(({ id, syntax }) => {
	const [state] = useEditorSetState()

	const style = { verticalAlign: "15%" }
	return (
		<Root id={id}>
			<Markdown syntax={syntax}>
				{state.readOnly && (
					<hr className="inline-block w-full" style={style} />
				)}
			</Markdown>
		</Root>
	)
})
