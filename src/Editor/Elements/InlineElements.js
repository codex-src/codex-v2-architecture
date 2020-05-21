import attrs from "./attrs"
import Markdown from "./Markdown"
import React from "react"

export const Escape = ({ syntax, children }) => (
	<Markdown syntax={syntax}>
		{children}
	</Markdown>
)

export const Emoji = ({ description, children }) => (
	<span aria-label={description} role="img">
		<Markdown>
			{children}
		</Markdown>
	</span>
)

export const Emphasis = ({ syntax, children }) => (
	<em>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</em>
)

export const Strong = ({ syntax, children }) => (
	<strong>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</strong>
)

export const StrongEmphasis = ({ syntax, children }) => (
	<strong>
		<em>
			<Markdown syntax={syntax}>
				{children}
			</Markdown>
		</em>
	</strong>
)

export const Code = ({ syntax, children }) => (
	<code {...attrs.disableAutoCorrect}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</code>
)

export const Strikethrough = ({ syntax, children }) => (
	<strike>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</strike>
)

export const Anchor = ({ syntax, href, children }) => (
	<a href={href} {...attrs.a}>
		<Markdown syntax={!children || syntax} {...attrs.disableAutoCorrect}>
			{children || syntax}
		</Markdown>
	</a>
)
