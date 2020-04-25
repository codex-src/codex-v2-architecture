import attrs from "./attrs"
import Markdown from "./Markdown"
import React from "react"
import useEditorState from "./useEditorState"

const Span = ({ className, ...props }) => (
	<span className={!className ? "markdown" : `markdown ${className}`} {...props} />
)

export const Escape = ({ syntax, children }) => (
	<Span>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</Span>
)

export const Emoji = ({ description, children }) => (
	<Span className="emoji" aria-label={description} role="img">
		<Markdown>
			{children}
		</Markdown>
	</Span>
)

export const Emphasis = ({ syntax, children }) => (
	<Span className="italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</Span>
)

export const Strong = ({ syntax, children }) => (
	<Span className="font-semibold">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</Span>
)

export const StrongEmphasis = ({ syntax, children }) => (
	<Span className="font-semibold italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</Span>
)

export const Code = ({ syntax, children }) => {
	const [{ readOnly }] = useEditorState()
	return (
		<Span className="px-1 py-px font-mono text-sm text-red-600 bg-red-100 rounded" {...attrs.code}>
			<Markdown className="text-red-600" syntax={syntax}>
				{!readOnly ? (
					children
				) : (
					children.trim()
				)}
			</Markdown>
		</Span>
	)
}

export const Strikethrough = ({ syntax, children }) => (
	<Span {...attrs.strike}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</Span>
)

export const Anchor = ({ syntax, href, children }) => (
	<a className="underline text-md-blue-a400" href={href} {...attrs.a}>
		<Markdown syntax={!children || syntax}>
			{children || syntax}
		</Markdown>
	</a>
)
