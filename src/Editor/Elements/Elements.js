import attrs from "./attrs"
import dedupeSpaces from "lib/dedupeSpaces"
import escape from "lodash/escape"
import IfWrapper from "lib/IfWrapper"
import Markdown from "./Markdown"
import prismMap from "lib/prismMap"
import React from "react"
import typeEnumArray from "./typeEnumArray"
import useEditorState from "../useEditorState"
import { Strikethrough } from "./InlineElements"

import {
	Node,
	Root,
} from "./HOC"

// Converts a parsed data structure (children) to renderable
// React components.
function toReact(children) {
	if (children === null || typeof children === "string") {
		return !children ? null : <span key={Math.random().toString(16).substr(2, 4)}>{children}</span>
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

const headerClassNames = {
	h1: dedupeSpaces("font-semibold text-3xl leading-tight antialiased"),
	h2: dedupeSpaces("font-semibold text-2xl leading-tight antialiased"),
	h3: dedupeSpaces("font-semibold text-xl  leading-tight antialiased"),
	h4: dedupeSpaces("font-semibold text-xl  leading-tight antialiased"),
	h5: dedupeSpaces("font-semibold text-xl  leading-tight antialiased"),
	h6: dedupeSpaces("font-semibold text-xl  leading-tight antialiased"),
}

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<Root tag={tag} id={id} className={headerClassNames[tag]}>
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Root>
))

export const Paragraph = React.memo(({ id, children }) => (
	<Root tag="p" id={id}>
		{toReact(children) || (
			<br />
		)}
	</Root>
))

export const BlockquoteItem = React.memo(({ id, syntax, children }) => (
	<Node tag="li" id={id} className="list-none text-gray-600">
		<Markdown style={{ letterSpacing: "0.25em" }} syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

export const Blockquote = React.memo(({ id, children: range }) => (
	<Root tag="blockquote" id={id} className="pl-6" style={{ boxShadow: "inset 0.25em 0 var(--gray-300)" }}>
		{range.map(({ type: T, ...each }) => (
			React.createElement(typeEnumArray[T], {
				key: each.id,
				...each,
			})
		))}
	</Root>
))

const Pre = props => (
	<Node className="whitespace-pre" {...props} />
)
const PreEdge = props => (
	<Node className="whitespace-pre leading-none" {...props} />
)

// TODO: Tab "\t" can cause the fmt.Println(")" bug?
//
// -> \tfmt.Println()<cursor>
// -> \tfmt.Println(<cursor>)
// -> \tfmt.Println(")"<cursor>
//
// TODO: Extract <Preformated>
export const Preformatted = React.memo(({ id, syntax, extension, children: range }) => {
	const [{ readOnly }] = useEditorState()

	// NOTE: Use useMemo not useState; state needs to be
	// updated eagerly
	const $range = React.useMemo(() => {
		const r = range.slice(1, -1)
		if (!extension || range.length === 2) {
			return r.map(each => ({ ...each, data: escape(each.data) }))
		}
		const parser = prismMap[extension]
		if (!parser) {
			return r.map(each => ({ ...each, data: escape(each.data) }))
		}
		const data = r.map(each => each.data).join("\n")
		const html = window.Prism.highlight(data, parser, extension)
		return html.split("\n").map((each, x) => ({ id: r[x].id, data: each }))
	}, [extension, range])

	return (
		<Root tag="pre" id={id} className="px-6 rounded shadow-hero overflow-x-scroll scrolling-touch" {...attrs.disableAutoCorrect}>
			<code className="inline-block min-w-full">
				<PreEdge id={range[0].id}>
					<Markdown syntax={[syntax[0]]}>
						{readOnly && (
							<br />
						)}
					</Markdown>
				</PreEdge>
				{$range.map(each => (
					<Pre key={each.id} id={each.id}>
						{/* TODO: Can we put dangerouslySetInnerHTML on
						<Pre>? */}
						<span dangerouslySetInnerHTML={{
							__html: each.data || (
								"<br />"
							),
						}} />
					</Pre>
				))}
				<PreEdge id={range[range.length - 1].id}>
					<Markdown syntax={[syntax[1]]}>
						{readOnly && (
							<br />
						)}
					</Markdown>
				</PreEdge>
			</code>
		</Root>
	)
})

// TODO: Extract <AnyList>
export const AnyListItem = React.memo(({ tag, id, syntax, ordered, children }) => (
	<Node tag={tag} id={id} className="my-1" data-codex-ordered={ordered}>
		<Markdown className="hidden" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</Node>
))

export const TodoItem = React.memo(({ tag, id, syntax, checked, children }) => {
	const [, { checkTodo }] = useEditorState()
	const ref = React.useRef()

	return (
		<Node tag={tag} id={id} className="relative my-1" data-codex-checked={checked}>
			<Markdown className="hidden" syntax={syntax}>
				<div className="absolute">
					<input
						ref={ref}
						className={dedupeSpaces(`
							form-checkbox
							text-md-blue-a200
							border-none
							rounded-md
							shadow-hero
							transform
							scale-105
							transition
							ease-out
							duration-150
							cursor-pointer
						`)}
						type="checkbox"
						checked={checked}
						onChange={() => {
							ref.current.focus()
							checkTodo(id)
						}}
					/>
				</div>
				<IfWrapper cond={checked} wrapper={({ children }) => <Strikethrough>{children}</Strikethrough>}>
					{toReact(children) || (
						<br />
					)}
				</IfWrapper>
			</Markdown>
		</Node>
	)
})

// NOTE: <AnyList> computes recursed
export const AnyList = React.memo(({ type, tag, id, children: range, recursed }) => {
	const Element = !recursed ? Root : Node
	return (
		// TODO
		<Element tag={tag} id={id} className="ml-6">
			{range.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
					recursed: true,
					...each,
				})
			))}
		</Element>
	)
})

export const Image = React.memo(({ id, syntax, src, alt, href, children }) => {
	const [{ readOnly }] = useEditorState()
	return (
		<Root tag="figure" id={id}>
			<IfWrapper cond={readOnly && Boolean(href)} wrapper={({ children }) => <a href={href} {...attrs.a}>{children}</a>}>
				{/* TODO */}
				<img className="mx-auto" style={{ minHeight: "1.5em", maxHeight: "24em" }} src={src} alt={alt} />
			</IfWrapper>
			{(!readOnly || (readOnly && children)) && (
				// TODO: Can we reuse <Anchor> here? Do we want to?
				<figcaption className="px-6 py-2 text-sm text-center text-gray-600">
					<Markdown syntax={syntax} {...attrs.disableAutoCorrect}>
						{toReact(children) || (
							<br />
						)}
					</Markdown>
				</figcaption>
			)}
		</Root>
	)
})

// TODO: Compute line-height?
const backgroundImage = "linear-gradient(" +
	"transparent 0, " +
	"transparent calc(0.75em - 2px), " +
	"var(--gray-300) calc(0.75em - 2px), " +
	"var(--gray-300) calc(0.75em + 2px), " +
	"transparent calc(0.75em + 2px)" +
")"

// FIXME
export const Break = React.memo(({ id, syntax }) => (
	// TODO: Use tag="hr"?
	<Root id={id} className="text-right" style={{ backgroundImage }}>
		<Markdown className="hidden" syntax={syntax}>
			<br />
		</Markdown>
	</Root>
))
