import * as HOC from "./HOC"
import attrs from "./attrs"
import escape from "lodash/escape"
import IfWrapper from "lib/IfWrapper"
import Markdown from "./Markdown"
import prismMap from "lib/prismMap"
import React from "react"
import typeEnumArray from "./typeEnumArray"
import useEditorState from "../useEditorState"

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
	<HOC.Node tag="li" id={id}>
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
			<HOC.Node id={range[0].id} style={{ whiteSpace: "pre", lineHeight: 1 }}>
				<Markdown syntax={[syntax[0]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</HOC.Node>
			{$range.map(each => (
				<HOC.Node key={each.id} id={each.id} style={{ whiteSpace: "pre" }}>
					<span dangerouslySetInnerHTML={{
						__html: each.data || (
							"<br />"
						),
					}} />
				</HOC.Node>
			))}
			<HOC.Node id={range[range.length - 1].id} style={{ whiteSpace: "pre", lineHeight: 1 }}>
				<Markdown syntax={[syntax[1]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</HOC.Node>
		</HOC.Root>
	)
})

export const AnyListItem = React.memo(({ tag, id, syntax, ordered, children }) => (
	<HOC.Node tag={tag} id={id}>
		<Markdown style={{ display: "hidden" }} syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Node>
))

// style={checked && attrs.strike.style}
export const TodoItem = React.memo(({ tag, id, syntax, checked, children }) => {
	const [, { checkTodo }] = useEditorState()
	const ref = React.useRef()

	return (
		// TODO
		<HOC.Node tag={tag} id={id} className="my-1 relative" data-codex-checked={checked}>
			<Markdown style={{ display: "hidden" }} syntax={syntax}>
				{/* TODO: Change absolute to style={{ position: "absolute" }} */}
				<div className="absolute">
					<input
						className="form-checkbox"
						type="checkbox"
						checked={checked}
						onChange={() => {
							// ref.current.focus()
							checkTodo(id)
						}}
					/>
				</div>
				{toReact(children) || (
					<br />
				)}
			</Markdown>
		</HOC.Node>
	)
})

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

// TODO: Compute line-height?
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
		<Markdown style={{ display: "hidden" }} syntax={syntax}>
			<br />
		</Markdown>
	</HOC.Root>
))
