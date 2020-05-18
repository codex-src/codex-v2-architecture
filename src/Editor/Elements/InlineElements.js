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
	<span aria-label={description} role="img" data-codex-emoji>
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

// export const Anchor = ({ syntax, href, children }) => {
// 	const [showURL, setShowURL] = React.useState(true)
// 	return (
// 		<a
// 			className="underline text-md-blue-a400"
// 			href={href}
// 			onMouseEnter={() => setShowURL(false)}
// 			onMouseLeave={() => setShowURL(true)}
// 			{...attrs.a}
// 		>
// 			<Markdown syntax={[syntax[0]]} />
// 			{children}
// 			<Markdown syntax={[syntax[1].slice(0, 2)]} />
// 			<Markdown
// 				syntax={[syntax[1].slice(2, -1)]}
// 				style={{ display: !showURL ? null : "none" }}
// 			/>
// 			{showURL && (
// 				<svg
// 					className="inline-block w-4 h-4"
// 					fill="none"
// 					strokeLinecap="round"
// 					strokeLinejoin="round"
// 					strokeWidth="2"
// 					stroke="currentColor"
// 					viewBox="0 0 24 24"
// 				>
// 					<path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
// 				</svg>
// 			)}
// 			<Markdown syntax={[syntax[1].slice(-1)]} />
// 		</a>
// 	)
// }
