import Markdown from "./Markdown"
import React from "react"
import typeEnumMap from "./typeEnumMap"
import useEditorState from "./useEditorState"

import {
	Node,
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
		components.push(React.createElement(typeEnumMap[T], {
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
	h1: trim("font-medium   text-3xl leading-tight"),
	h2: trim("font-medium   text-2xl leading-tight"),
	h3: trim("font-semibold text-xl  leading-tight"),
	h4: trim("font-semibold text-xl  leading-tight"),
	h5: trim("font-semibold text-xl  leading-tight"),
	h6: trim("font-semibold text-xl  leading-tight"),
}

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<Root id={id} className={headerClassNames[tag]}>
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

export const BlockquoteItem = React.memo(({ id, syntax, children }) => {
	const [state] = useEditorState()

	// const style = state.readOnly && { paddingLeft: "calc(19.203 / 16 * 1em)" }
	const style = state.readOnly && { paddingLeft: "calc(24 / 16 * 1em)" }
	return (
		<Node id={id} style={style}>
			<Markdown className="text-md-blue-a200" syntax={syntax}>
				{toReact(children) || (
					<br />
				)}
			</Markdown>
		</Node>
	)
})

// NOTE: Compound component
export const Blockquote = React.memo(({ id, children }) => {
	const [state] = useEditorState()

	const style = state.readOnly && { boxShadow: "inset 0.125em 0 var(--md-blue-a200)" }
	return (
		<Root id={id} style={style}>
			{children.map(({ type: T, ...each }) => (
				React.createElement(typeEnumMap[T], {
					key: each.id,
					...each,
				})
			))}
		</Root>
	)
})

export const Break = React.memo(({ id, syntax }) => {
	const [state] = useEditorState()

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
