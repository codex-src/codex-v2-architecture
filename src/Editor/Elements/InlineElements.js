import attrs from "./attrs"
import Markdown from "./Markdown"
import React from "react"

// const Span = ({ className, ...props }) => (
// 	<span className={!className ? "markdown" : `markdown ${className}`} {...props} />
// )

export const Escape = ({ syntax, children }) => (
	// <span>
	<Markdown syntax={syntax}>
		{children}
	</Markdown>
	// </span>
)

export const Emoji = ({ description, children }) => (
	<span className="emoji" aria-label={description} role="img">
		<Markdown>
			{children}
		</Markdown>
	</span>
)

export const Emphasis = ({ syntax, children }) => (
	<span className="italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const Strong = ({ syntax, children }) => (
	<span className="font-semibold">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const StrongEmphasis = ({ syntax, children }) => (
	<span className="font-semibold italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const Code = ({ syntax, children }) => (
	<span className="px-1 py-px font-mono text-sm text-md-blue-a400 border rounded" {...attrs.code}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const Strikethrough = ({ syntax, children }) => (
	<span {...attrs.strike}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const Anchor = ({ syntax, href, children }) => (
	<a className="underline text-md-blue-a400" href={href} {...attrs.a}>
		<Markdown syntax={!children || syntax}>
			{children || syntax}
		</Markdown>
	</a>
)
