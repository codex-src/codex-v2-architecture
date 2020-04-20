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
	h3: trim("font-medium   text-xl  leading-tight"),
	h4: trim("font-semibold text-lg  leading-snug"),
	h5: trim("font-semibold text-lg  leading-snug"),
	h6: trim("font-semibold text-lg  leading-snug"),
}

// Conditionally wraps a React component.
//
// TODO: Extract component and change API to props?
const IfWrapper = ({ cond, wrapper: Wrapper, children }) => {
	if (!cond) {
		return children
	}
	return <Wrapper>{children}</Wrapper>
}

const HeaderAnchor = ({ hash, children }) => (
	// NOTE: Use block to make <a> width: 100%
	<a id={hash} className="block" href={`#${hash}`}>
		{children}
	</a>
)

export const Header = React.memo(({ tag, id, syntax, hash, children }) => {
	const [state] = useEditorState()
	return (
		<Root id={id} className={headerClassNames[tag]}>
			<IfWrapper cond={state.readOnly} wrapper={({ children }) => <HeaderAnchor hash={hash}>{children}</HeaderAnchor>}>
				<Markdown syntax={syntax}>
					{toReact(children) || (
						<br />
					)}
				</Markdown>
			</IfWrapper>
		</Root>
	)
})

export const Paragraph = React.memo(({ id, emojis, children }) => (
	<Root id={id} className={!emojis ? null : `emojis emojis-${emojis}`}>
		{toReact(children) || (
			<br />
		)}
	</Root>
))

export const BlockquoteItem = React.memo(({ id, syntax, children }) => (
	<Node id={id}>
		<Markdown className="text-md-blue-a200" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

// NOTE: Compound component
export const Blockquote = React.memo(({ id, children }) => {
	const style = { backgroundColor: "#448aff0f", boxShadow: "inset 0.125em 0 var(--md-blue-a200)" }
	return (
		<Root id={id} className="py-4 px-8" style={style}>
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
