import attrs from "./attrs"
import escape from "lodash/escape"
import Markdown from "./Markdown"
import PrismExtensions from "PrismExtensions"
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
	h1: trim("font-semibold text-3xl leading-tight text-black antialiased"),
	h2: trim("font-semibold text-2xl leading-tight text-black antialiased"),
	h3: trim("font-semibold text-xl  leading-tight text-black antialiased"),
	h4: trim("font-semibold text-lg  leading-snug  text-black antialiased"),
	h5: trim("font-semibold text-lg  leading-snug  text-black antialiased"),
	h6: trim("font-semibold text-lg  leading-snug  text-black antialiased"),
}

// Conditionally wraps a React element.
const IfWrapper = ({ cond, wrapper: Wrapper, children }) => {
	if (!cond) {
		return children
	}
	return <Wrapper>{children}</Wrapper>
}

const HeaderAnchor = ({ hash, children }) => (
	<a id={hash} className="block" href={`#${hash}`}>{children}</a>
)

export const Header = React.memo(({ tag, id, syntax, hash, children }) => {
	const ref = React.useRef()
	const [{ readOnly }] = useEditorState()

	// style={{ paddingTop: "1em" }}
	return (
		<Root ref={ref} id={id} className={headerClassNames[tag]}>
			<IfWrapper cond={readOnly} wrapper={({ children }) => <HeaderAnchor hash={hash}>{children}</HeaderAnchor>}>
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
 	// style={{ margin: !children && "-0.25em 0" }}
	<Root id={id} className={!emojis ? null : `emojis emojis-${emojis}`}>
		{toReact(children) || (
			<br />
		)}
	</Root>
))

export const BlockquoteItem = React.memo(({ id, syntax, children }) => (
	<Node id={id} className="text-gray-600">
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

// NOTE: Compound React element
export const Blockquote = React.memo(({ id, children }) => {
	const style = { boxShadow: "inset 0.25em 0 var(--gray-300)" }
	return (
		<Root id={id} className="px-6" style={style}>
			{children.map(({ type: T, ...each }) => (
				React.createElement(typeEnumMap[T], {
					key: each.id,
					...each,
				})
			))}
		</Root>
	)
})

export const Pre = props => (
	<Node style={{ whiteSpace: "pre" }} {...props} />
)

// NOTE: Compound React element
export const CodeBlock = React.memo(({ id, syntax, extension, children: nodes }) => {
	const [{ readOnly }] = useEditorState()

	// NOTE: Use useMemo not useState; state needs to be
	// updated eagerly
	const $nodes = React.useMemo(() => {
		const range = nodes.slice(1, -1)
		if (!extension || nodes.length === 2) {
			return range.map(each => ({ ...each, data: escape(each.data) }))
		}
		const parser = PrismExtensions[extension]
		if (!parser) {
			return range.map(each => ({ ...each, data: escape(each.data) }))
		}
		// TODO: Move to parser? Moving syntax highlighting to
		// parser (possibly) breaks cmap
		const data = range.map(each => each.data).join("\n")
		const __html = window.Prism.highlight(data, parser, extension)
		return __html.split("\n").map((each, x) => ({ id: range[x].id, data: each }))
	}, [extension, nodes])

	return (
		<Root id={id} className="px-6 font-mono text-sm bg-white shadow-hero rounded overflow-x-scroll scrolling-touch" {...attrs.code}>
			{/* NOTE: inline-block is needed for overflow-x-scroll */}
			<span className="inline-block">
				<Pre id={nodes[0].id} className="leading-none">
					<Markdown syntax={[syntax[0]]}>
						{readOnly && (
							<br />
						)}
					</Markdown>
				</Pre>
				{$nodes.map(each => (
					// TODO: Add support for read-only line numbers
					<Pre key={each.id} id={each.id} className="leading-snug">
						<span dangerouslySetInnerHTML={{
							__html: each.data || (
								"<br />"
							),
						}} />
					</Pre>
				))}
				<Pre id={nodes[nodes.length - 1].id} className="leading-none">
					<Markdown syntax={[syntax[1]]}>
						{readOnly && (
							<br />
						)}
					</Markdown>
				</Pre>
			</span>
		</Root>
	)
})

export const Break = React.memo(({ id, syntax }) => {
	const [{ readOnly }] = useEditorState()

	const style = { verticalAlign: "15%" }
	return (
		<Root id={id}>
			<Markdown syntax={syntax}>
				{readOnly && (
					<hr className="inline-block w-full border-t-2" style={style} />
				)}
			</Markdown>
		</Root>
	)
})
