import * as HOC from "./HOC"
import attrs from "./attrs"
import Button from "lib/Button"
import escape from "lodash/escape"
import IfWrapper from "lib/IfWrapper"
import Markdown from "./Markdown"
import prismMap from "lib/prismMap"
import React from "react"
import trimWhiteSpace from "lib/trimWhiteSpace"
import typeEnum from "./typeEnum"
import typeEnumArray from "./typeEnumArray"
import useEditorState from "../useEditorState"

// Converts a parsed data structure (children) to renderable
// React components.
function toReact(children) {
	if (children === null || typeof children === "string") {
		return <span>{children || <br />}</span>
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

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<HOC.Root tag={tag} id={id}>
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Root>
))

export const Paragraph = React.memo(({ id, children }) => (
	<HOC.Root tag="p" id={id}>
		{toReact(children) || (
			<br />
		)}
	</HOC.Root>
))

export const BlockquoteItem = React.memo(({ id, syntax, children }) => (
	<HOC.Node tag="p" id={id}>
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Node>
))

export const Blockquote = React.memo(({ id, children: range }) => (
	<HOC.Root tag="blockquote" id={id}>
		{range.map(({ type: T, ...each }) => (
			React.createElement(typeEnumArray[T], {
				key: each.id,
				...each,
			})
		))}
	</HOC.Root>
))

const Pre = props => (
	<HOC.Node style={{ whiteSpace: "pre" }} {...props} />
)

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
		<HOC.Root tag="pre" id={id} {...attrs.disableAutoCorrect}>
			<code>
				<Pre id={range[0].id}>
					<Markdown syntax={[syntax[0]]}>
						{readOnly && (
							<br />
						)}
					</Markdown>
				</Pre>
				{$range.map(each => (
					<Pre key={each.id} id={each.id}>
						<span dangerouslySetInnerHTML={{
							__html: each.data || (
								"<br />"
							),
						}} />
					</Pre>
				))}
				<Pre id={range[range.length - 1].id}>
					<Markdown syntax={[syntax[1]]}>
						{readOnly && (
							<br />
						)}
					</Markdown>
				</Pre>
			</code>
		</HOC.Root>
	)
})

export const AnyListItem = React.memo(({ tag, id, syntax, ordered, children }) => (
	<HOC.Node tag={tag} id={id}>
		{/* TODO: Change hidden to style={{ display: "none" }} */}
		<Markdown className="hidden" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Node>
))

const TodoItemCheckbox = ({ id, checked }) => {
	const [, { checkTodo }] = useEditorState()
	const ref = React.useRef()

	return (
		// FIXME: Tag?
		<button
			ref={ref}
			className={ // TODO
				`-mt-px w-4 h-4 align-middle ${!checked
					? "bg-white shadow-hero"
					: "bg-md-blue-a200 shadow"
				} rounded-md focus:outline-none transform scale-105 transition ease-out duration-75`
			}
			onClick={() => {
				ref.current.focus()
				checkTodo(id)
			}}
			data-codex-checkbox={checked}
		>
			<svg fill="#fff" viewBox="0 0 16 16">
				<path d="M5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293z"></path>
			</svg>
		</button>
	)
}

// style={checked && attrs.strike.style}
export const TodoItem = React.memo(({ tag, id, syntax, checked, children }) => (
	// TODO
	<HOC.Node tag={tag} id={id} className="my-1 relative" data-codex-checked={checked}>
		{/* TODO: Change hidden to style={{ display: "none" }} */}
		<Markdown className="hidden" syntax={syntax}>
			{/* TODO: Change absolute to style={{ position: "absolute" }} */}
			<div className="absolute">
				<TodoItemCheckbox id={id} checked={checked} />
			</div>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Node>
))

// NOTE: Computes recursed
export const AnyList = React.memo(({ type, tag, id, children: range, recursed }) => {
	const Parent = !recursed ? HOC.Root : HOC.Node
	return (
		// TODO
		<Parent tag={tag} id={id} className="ml-6">
			{range.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
					recursed: true,
					...each,
				})
			))}
		</Parent>
	)
})

export const Image = React.memo(({ id, syntax, src, alt, href, children }) => {
	const [{ readOnly }] = useEditorState()
	return (
		<HOC.Root tag="figure" id={id}>
			<IfWrapper cond={readOnly && Boolean(href)} wrapper={({ children }) => <a href={href} {...attrs.a}>{children}</a>}>
				{/* TODO */}
				<img style={{ minHeight: "1.5em", maxHeight: "24em" }} src={src} alt={alt} />
			</IfWrapper>
			{(!readOnly || (readOnly && children)) && (
				<figcaption>
					<Markdown syntax={syntax} {...attrs.disableAutoCorrect}>
						{toReact(children) || (
							<br />
						)}
					</Markdown>
				</figcaption>
			)}
		</HOC.Root>
	)
})

const backgroundImage = "linear-gradient(" +
	"transparent 0, " +
	"transparent calc(0.75em - 2px), " +
	"var(--gray-300) calc(0.75em - 2px), " +
	"var(--gray-300) calc(0.75em + 2px), " +
	"transparent calc(0.75em + 2px)" +
")"

export const Break = React.memo(({ id, syntax }) => (
	// TODO: Use tag="hr"?
	<HOC.Root id={id} className="text-right" style={{ backgroundImage }}>
		{/* TODO: Change hidden to style={{ display: "none" }} */}
		<Markdown className="hidden" syntax={syntax}>
			<br />
		</Markdown>
	</HOC.Root>
))
