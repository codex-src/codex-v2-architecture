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
	h1: trim("font-medium   text-3xl leading-tight text-black antialiased"),
	h2: trim("font-semibold text-2xl leading-tight text-black antialiased"),
	h3: trim("font-semibold text-xl  leading-tight text-black antialiased"),
	h4: trim("font-semibold text-xl  leading-tight text-black antialiased"),
	h5: trim("font-semibold text-xl  leading-tight text-black antialiased"),
	h6: trim("font-semibold text-xl  leading-tight text-black antialiased"),
}

// export const Header = React.memo(({ tag, id, syntax, hash, children }) => {
// 	const [{ readOnly }] = useEditorState()
//
// 	return (
// 		React.createElement(
// 			!readOnly ? Root : "a",
// 			{
// 				id: !readOnly ? id : hash,
// 				className: headerClassNames[tag],
// 				href: !readOnly ? undefined : `#${hash}`,
// 			},
// 			<Markdown syntax={syntax}>
// 				{toReact(children) || (
// 					<br />
// 				)}
// 			</Markdown>,
// 		)
// 	)
// })

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<Root id={id} className={headerClassNames[tag]}>
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Root>
))

export const Paragraph = React.memo(({ id, emojis, children }) => {
	// const style = { margin: !children && "-0.25em 0" }
	return (
		<Root id={id} className={!emojis ? null : `emojis emojis__${emojis}`} /* style={style} */>
			{toReact(children) || (
				<br />
			)}
		</Root>
	)
})

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

export const Blockquote = React.memo(({ id, children: range }) => {
	const style = { boxShadow: "inset 0.25em 0 var(--gray-300)" }
	return (
		<Root id={id} className="px-6" style={style}>
			{range.map(({ type: T, ...each }) => (
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

export const Preformatted = React.memo(({ id, syntax, extension, children: range }) => {
	const [{ readOnly }] = useEditorState()

	// NOTE: Use useMemo not useState; state needs to be
	// updated eagerly
	const $range = React.useMemo(() => {
		const r = range.slice(1, -1)
		if (!extension || range.length === 2) {
			return r.map(each => ({ ...each, data: escape(each.data) }))
		}
		const parser = PrismMap[extension]
		if (!parser) {
			return r.map(each => ({ ...each, data: escape(each.data) }))
		}
		const data = r.map(each => each.data).join("\n")
		const html = window.Prism.highlight(data, parser, extension)
		return html.split("\n").map((each, x) => ({ id: r[x].id, data: each }))
	}, [extension, range])

	return (
		<Root id={id} className="px-6 font-mono text-sm leading-snug border" {...attrs.code}>
			<Node id={range[0].id}>
				<Markdown syntax={[syntax[0]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</Node>
			{$range.map(each => (
				<Node key={each.id} id={each.id}>
					<span dangerouslySetInnerHTML={{
						__html: each.data || (
							"<br />"
						),
					}} />
				</Node>
			))}
			<Node id={range[range.length - 1].id}>
				<Markdown syntax={[syntax[1]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</Node>
		</Root>
	)
})

export const AnyListItem = React.memo(({ tag, id, syntax, ordered, children }) => (
	<Node tag={tag} id={id} className="my-2" data-codex-ordered={ordered}>
		<Markdown className="hidden" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

const Checkbox = ({ id, checked }) => (
	<Button
		className={
			`-mt-px inline-block w-4 h-4 align-middle ${
				!checked
					? "bg-white shadow-hero"
					: "bg-md-blue-a200 shadow"
			} focus:shadow rounded-md transform scale-105 pointer-events-auto`
		}
		data-codex-checkbox={checked}
	>
		<svg fill="#fff" viewBox="0 0 16 16">
			<path d="M5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293z"></path>
		</svg>
	</Button>
)

export const TodoItem = React.memo(({ tag, id, syntax, checked, children }) => (
	<Node tag={tag} id={id} className="relative my-2" style={checked && attrs.strike.style} data-codex-checked={checked}>
		<Markdown className="hidden" syntax={syntax}>
			<div className="absolute">
				<Checkbox id={id} checked={checked} />
			</div>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

export const AnyList = React.memo(({ root, type, tag, id, children: range }) => {
	const HOC = root ? Root : Node
	return (
		<HOC tag={tag} id={id} className="ml-5">
			{range.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
					...each,
				})
			))}
		</HOC>
	)
})

// Conditionally wraps a React element.
const IfWrapper = ({ cond, wrapper: Wrapper, children }) => {
	if (!cond) {
		return children
	}
	return <Wrapper>{children}</Wrapper>
}

export const Image = React.memo(({ id, syntax, src, alt, href, children }) => {
	const [{ readOnly }] = useEditorState()

	// NOTE: Assumes line-height is 1.5em
	const style = { minHeight: "1.5em", maxHeight: "24em" }
	return (
		<Root id={id} className="-mx-6">
			<IfWrapper cond={readOnly && href} wrapper={({ children }) => <a href={href} {...attrs.a}>{children}</a>}>
				<img className="mx-auto" style={style} src={src} alt={alt} />
			</IfWrapper>
			{(!readOnly || (readOnly && children)) && (
				<div className="px-6 py-2 text-sm text-center text-gray-600">
					<Markdown /* className="hidden" */ syntax={syntax}>
						{toReact(children) || (
							<br />
						)}
					</Markdown>
				</div>
			)}
		</Root>
	)
})

export const Break = React.memo(({ id, syntax }) => {
	// NOTE: Assumes line-height is 1.5em
	const style = { backgroundImage: "linear-gradient(transparent 0, transparent calc(0.75em - 1px), var(--gray-300) calc(0.75em - 1px), transparent calc(0.75em + 1px))" }

	return (
		<Root id={id} className="text-right" style={style}>
			<Markdown className="hidden" syntax={syntax}>
				<br />
			</Markdown>
		</Root>
	)
})
