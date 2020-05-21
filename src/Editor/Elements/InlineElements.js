import attrs from "./attrs"
import Markdown from "./Markdown"
import React from "react"

export const Escape = ({ syntax, children }) => (
	// <span>
	<Markdown syntax={syntax}>
		{children}
	</Markdown>
	// </span>
)

export const Emoji = ({ description, children }) => (
	<span aria-label={description} role="img" data-codex-emoji>
		<Markdown>
			{children}
		</Markdown>
	</span>
)

export const Emphasis = ({ syntax, children }) => (
	<em className="italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</em>
)

export const Strong = ({ syntax, children }) => (
	<strong className="font-semibold">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</strong>
)

export const StrongEmphasis = ({ syntax, children }) => (
	<strong className="font-semibold italic">
		{/* FIXME? */}
		<em>
			<Markdown syntax={syntax}>
				{children}
			</Markdown>
		</em>
	</strong>
)

export const Code = ({ syntax, children }) => (
	<code className="px-1 py-px font-mono text-sm text-md-blue-a400 border rounded" {...attrs.disableAutoCorrect}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</code>
)

export const Strikethrough = ({ syntax, children }) => (
	<strike {...attrs.strike}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</strike>
)

export const Anchor = ({ syntax, href, children }) => (
	<a className="underline text-md-blue-a400" href={href} {...attrs.a}>
		<Markdown syntax={!children || syntax} {...attrs.disableAutoCorrect}>
			{children || syntax}
		</Markdown>
	</a>
)
