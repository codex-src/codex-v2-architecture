import * as HOC from "./HOC"
import Button from "lib/Button"
import Markdown from "./Markdown"
import React from "react"
import attrs from "./attrs"
import escape from "lodash/escape"
import prismMap from "lib/prismMap"
import trimWhiteSpace from "lib/trimWhiteSpace"
import typeEnumArray from "./typeEnumArray"
import useEditorState from "../useEditorState"

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

const headerClassNames = {
	h1: trimWhiteSpace("font-semibold text-3xl leading-tight antialiased"),
	h2: trimWhiteSpace("font-semibold text-2xl leading-tight antialiased"),
	h3: trimWhiteSpace("font-semibold text-xl  leading-tight antialiased"),
	h4: trimWhiteSpace("font-semibold text-xl  leading-tight antialiased"),
	h5: trimWhiteSpace("font-semibold text-xl  leading-tight antialiased"),
	h6: trimWhiteSpace("font-semibold text-xl  leading-tight antialiased"),
}

export const Header = React.memo(({ tag, id, syntax, hash, children }) => (
	<HOC.Root id={id} className={headerClassNames[tag]}>
		<Markdown syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Root>
))

export const Paragraph = React.memo(({ id, emojis, children }) => (
	<HOC.Root id={id} data-codex-emojis={emojis}>
		{toReact(children) || (
			<br />
		)}
	</HOC.Root>
))

// export const BlockquoteItem = React.memo(({ id, syntax, children }) => (
// 	<HOC.Node id={id} className={syntax[0] === ">" ? "pl-1" : "pl-6 text-gray-600"} data-codex-blockquote-item>
// 		<Markdown className="hidden" syntax={syntax}>
// 			{toReact(children) || (
// 				<br />
// 			)}
// 		</Markdown>
// 	</HOC.Node>
// ))
//
// export const Blockquote = React.memo(({ id, children: range }) => (
// 	<HOC.Root tag="blockquote" id={id} style={{ boxShadow: "inset 0.25em 0 var(--gray-300)" }}>
// 		{range.map(({ type: T, ...each }) => (
// 			React.createElement(typeEnumArray[T], {
// 				key: each.id,
// 				...each,
// 			})
// 		))}
// 	</HOC.Root>
// ))

export const BlockquoteItem = React.memo(({ id, syntax, children }) => (
	<HOC.Root id={id} className="text-gray-600">
		<Markdown className="text-md-blue-a400" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Root>
))

export const Blockquote = React.memo(({ id, children: range }) => (
	<HOC.Root id={id} className="-ml-6 pl-6" style={{ boxShadow: "inset 0.25em 0 var(--gray-300)" }}>
		{range.map(({ type: T, ...each }) => (
			React.createElement(typeEnumArray[T], {
				key: each.id,
				...each,
			})
		))}
	</HOC.Root>
))

// export const Pre = props => (
// 	<HOC.Node style={{ whiteSpace: "pre" }} {...props} />
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
		const parser = prismMap[extension]
		if (!parser) {
			return r.map(each => ({ ...each, data: escape(each.data) }))
		}
		const data = r.map(each => each.data).join("\n")
		const html = window.Prism.highlight(data, parser, extension)
		return html.split("\n").map((each, x) => ({ id: r[x].id, data: each }))
	}, [extension, range])

	return (
		<HOC.Root id={id} className="-mx-6 px-6 rounded shadow-hero" {...attrs.code}>
			<HOC.Node id={range[0].id} className="font-mono text-sm leading-none">
				<Markdown syntax={[syntax[0]]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</HOC.Node>
			{$range.map(each => (
				<HOC.Node key={each.id} id={each.id} className="font-mono text-sm leading-snug">
					<span dangerouslySetInnerHTML={{
						__html: each.data || (
							"<br />"
						),
					}} />
				</HOC.Node>
			))}
			<HOC.Node id={range[range.length - 1].id} className="font-mono text-sm leading-none">
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
	<HOC.Node tag={tag} id={id} className="my-1" data-codex-ordered={ordered}>
		<Markdown className="hidden" syntax={syntax}>
			{toReact(children) || (
				<br />
			)}
		</Markdown>
	</HOC.Node>
))

const Checkbox = ({ id, checked, handleClick }) => (
	<Button
		className={
			`-mt-px w-4 h-4 align-middle ${
				!checked
					? "bg-white shadow-hero"
					: "bg-md-blue-a200 shadow"
			} rounded-md focus:outline-none transform scale-105 pointer-events-auto transition ease-out duration-75`
		}
		data-codex-checkbox={checked}
		onClick={handleClick}
	>
		<svg fill="#fff" viewBox="0 0 16 16">
			<path d="M5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293z"></path>
		</svg>
	</Button>
)

export const TodoItem = React.memo(({ tag, id, syntax, checked, children }) => {
	const [, { checkTodo }] = useEditorState()

	return (
		<HOC.Node tag={tag} id={id} className="my-1 relative" style={checked && attrs.strike.style} data-codex-checked={checked}>
			<Markdown className="hidden" syntax={syntax}>
				<div className="absolute">
					<Checkbox id={id} checked={checked} handleClick={() => {
						document.activeElement.blur(); checkTodo(id)
					}} />
				</div>
				{toReact(children) || (
					<br />
				)}
			</Markdown>
		</HOC.Node>
	)
})

export const AnyList = React.memo(({ atRoot, type, tag, id, children: range }) => {
	const Parent = atRoot ? HOC.Root : HOC.Node
	return (
		<Parent tag={tag} id={id} className="ml-6">
			{range.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
					...each,
				})
			))}
		</Parent>
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
	return (
		<HOC.Root id={id} className="-mx-6">
			<IfWrapper cond={readOnly && href} wrapper={({ children }) => <a href={href} {...attrs.a}>{children}</a>}>
				{/* contentEditable={false} */}
				<img className="mx-auto" style={{ minHeight: "1.5em", maxHeight: "24em" }} src={src} alt={alt} />
			</IfWrapper>
			{(!readOnly || (readOnly && children)) && (
				<div className="px-6 py-2 text-sm text-center text-gray-600">
					<Markdown syntax={syntax}>
						{toReact(children) || (
							<br />
						)}
					</Markdown>
				</div>
			)}
		</HOC.Root>
	)
})

// export const Break = React.memo(({ id, syntax }) => {
// 	const [{ readOnly }] = useEditorState()
// 	return (
// 		<HOC.Root id={id}>
// 			<Markdown syntax={syntax}>
// 				{readOnly && (
// 					<hr className="inline-block w-full border-t-2"
// 						style={{ verticalAlign: "15%" }} />
// 				)}
// 			</Markdown>
// 		</HOC.Root>
// 	)
// })

const hr = "linear-gradient(" +
	"transparent 0, " +
	"transparent calc(0.75em - 2px), " +
	"var(--gray-300) calc(0.75em - 2px), " +
	"var(--gray-300) calc(0.75em + 2px), " +
	"transparent calc(0.75em + 2px)" +
")"

export const Break = React.memo(({ id, syntax }) => (
	<HOC.Root id={id} className="text-right" style={{ backgroundImage: hr }}>
		<Markdown className="hidden" syntax={syntax}>
			<br />
		</Markdown>
	</HOC.Root>
))
