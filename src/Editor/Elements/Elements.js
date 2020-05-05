import attrs from "./attrs"
import Button from "lib/Button"
import escape from "lodash/escape"
import Markdown from "./Markdown"
import PrismMap from "lib/PrismMap"
import React from "react"
import typeEnumArray from "./typeEnumArray"
import useEditorState from "../useEditorState"

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
		components.push(React.createElement(typeEnumArray[T], {
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
	h4: trim("font-semibold text-xl  leading-tight text-black antialiased"),
	h5: trim("font-semibold text-xl  leading-tight text-black antialiased"),
	h6: trim("font-semibold text-xl  leading-tight text-black antialiased"),
}

// // Conditionally wraps a React element.
// const IfWrapper = ({ cond, wrapper: Wrapper, children }) => {
// 	if (!cond) {
// 		return children
// 	}
// 	return <Wrapper>{children}</Wrapper>
// }
//
// const HeaderAnchor = ({ hash, children }) => (
// 	<a id={hash} className="block" href={`#${hash}`}>{children}</a>
// )
//
// <IfWrapper cond={tag !== "h1" && readOnly} wrapper={({ children }) => <HeaderAnchor hash={hash}>{children}</HeaderAnchor>}>

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<Root id={id} className={headerClassNames[tag]}>
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Root>
))

export const Paragraph = React.memo(({ id, emojis, children }) => (
	<Root id={id} className={!emojis ? null : `emojis emojis__${emojis}`}>
		{toReact(children) || (
			<br />
		)}
	</Root>
))

export const BlockquoteItem = React.memo(({ id, syntax, children }) => {
	const style = { marginRight: "1ch" }
	return (
		<Node id={id} className="text-gray-600">
			<Markdown className="text-md-blue-a400" style={style} syntax={syntax}>
				{toReact(children) || (
					<br />
				)}
			</Markdown>
		</Node>
	)
})

export const Blockquote = React.memo(({ id, children: nodes }) => {
	const style = { boxShadow: "inset 0.25em 0 var(--gray-300)" }
	return (
		<Root id={id} className="px-6" style={style}>
			{nodes.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
					...each,
				})
			))}
		</Root>
	)
})

// export const Pre = props => (
// 	<Node style={{ whiteSpace: "pre" }} {...props} />
// )

export const Preformatted = React.memo(({ id, syntax, extension, children: nodes }) => {
	const [{ readOnly }] = useEditorState()

	// NOTE: Use useMemo not useState; state needs to be
	// updated eagerly
	const $nodes = React.useMemo(() => {
		const range = nodes.slice(1, -1)
		if (!extension || nodes.length === 2) {
			return range.map(each => ({ ...each, data: escape(each.data) }))
		}
		const parser = PrismMap[extension]
		if (!parser) {
			return range.map(each => ({ ...each, data: escape(each.data) }))
		}
		const data = range.map(each => each.data).join("\n")
		const html = window.Prism.highlight(data, parser, extension)
		return html.split("\n").map((each, x) => ({ id: range[x].id, data: each }))
	}, [extension, nodes])

	return (
		<Root id={id} className="px-6 font-mono text-sm leading-snug bg-white shadow-hero rounded" {...attrs.code}>
			<Node id={nodes[0].id} className="leading-none">
				<Markdown syntax={[syntax[0]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</Node>
			{$nodes.map(each => (
				<Node key={each.id} id={each.id}>
					<span dangerouslySetInnerHTML={{
						__html: each.data || (
							"<br />"
						),
					}} />
				</Node>
			))}
			<Node id={nodes[nodes.length - 1].id} className="leading-none">
				<Markdown syntax={[syntax[1]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</Node>
		</Root>
	)
})

export const AnyListItem = React.memo(({ tag, id, syntax, children }) => (
	<Node tag="li" id={id} className="my-2">
		<Markdown className="hidden" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

const Checkbox = ({ checked }) => (
	<Button className={
		`checkbox ${
			!checked
				? "checkbox--unchecked"
				: "checkbox--checked"
		} -mt-px inline-block w-4 h-4 align-middle ${
			!checked
				? "bg-white shadow-hero"
				: "bg-md-blue-a200 shadow"
		} focus:shadow rounded-md transform scale-105`
	}>
		<svg fill="#fff" viewBox="0 0 16 16">
			<path d="M5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293z"></path>
		</svg>
	</Button>
)

export const TodoItem = React.memo(({ tag, id, syntax, checked, children }) => (
	<Node tag="li" id={id} className="todo relative my-2" style={checked && attrs.strike.style}>
		<Markdown className="hidden" syntax={syntax}>
			<div className="absolute">
				<Checkbox checked={checked} />
			</div>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

// NOTE: __nested is not parsed
export const AnyList = React.memo(({ type, tag, id, __nested, children: nodes }) => {
	const HOC = __nested === undefined ? Root : Node
	return (
		<HOC tag={tag} id={id} className="ml-5">
			{nodes.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
					__nested: true,
					...each,
				})
			))}
		</HOC>
	)
})

export const Break = React.memo(({ id, syntax }) => {
	const [{ readOnly }] = useEditorState()

	const style = { verticalAlign: "15%" }
	return (
		<Root id={id} className="relative">
			<Markdown syntax={syntax}>
				{readOnly && (
					<hr className="inline-block w-full border-t-2 select-none" style={style} />
				)}
			</Markdown>
		</Root>
	)
})
