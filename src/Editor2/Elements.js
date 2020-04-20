import attrs from "./attrs"
import Highlighted from "Highlighted"
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

// NOTE: Compound component
export const CodeBlock = React.memo(({ id, syntax, extension, children }) => {
	const [state] = useEditorState()
	const style = { whiteSpace: "pre" }
	return (
		<Root id={id} className="-mx-6 bg-white shadow-hero rounded" {...attrs.code}>
			<div className="px-6 whitespace-pre font-mono text-sm leading-snug overflow-x-scroll scrolling-touch">
				{/* Use inline-block to conserve padding-right */}
				<span className="inline-block">
					<Node id={children[0].id} className="py-px leading-none text-md-blue-a400" style={style}>
						<Markdown syntax={[syntax[0]]}>
							{state.readOnly && (
								<br />
							)}
						</Markdown>
					</Node>
					{children.slice(1, -1).map(each => (
						<Node key={each.id} id={each.id} style={style}>
							{each.data || (
								<br />
							)}
						</Node>
					))}
					<Node id={children[children.length - 1].id} className="py-px leading-none text-md-blue-a400" style={style}>
						<Markdown syntax={[syntax[1]]}>
							{state.readOnly && (
								<br />
							)}
						</Markdown>
					</Node>
				</span>
			</div>
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
