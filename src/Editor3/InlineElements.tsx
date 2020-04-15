import * as Types from "./__types"
import attrs from "./attrs"
import Markdown from "./Markdown"
import React from "react"

// export const Escape = ({ syntax, children }) => (
// 	<span>
// 		<Markdown syntax={syntax}>
// 			{children}
// 		</Markdown>
// 	</span>
// )
//
// export const E = ({ description, children }) => (
// 	<span className="emoji" aria-label={description} role="img">
// 		<Markdown>
// 			{children}
// 		</Markdown>
// 	</span>
// )

// TODO: Rename children to parsed?
export const Em = ({ syntax, children }: Types.EmphasisElement) => (
	<span className="italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const Strong = ({ syntax, children }: Types.StrongElement) => (
	<span className="font-semibold">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

export const StrongEmphasis = ({ syntax, children }: Types.StrongElement) => (
	<span className="font-semibold italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

// export const Code = ({ syntax, children }) => (
// 	<span className="py-px font-mono text-sm text-red-600 bg-red-100 rounded" {...attrs.code}>
// 		<Markdown className="text-red-600" syntax={syntax}>
// 			{children}
// 		</Markdown>
// 	</span>
// )
//
// export const Strike = ({ syntax, children }) => (
// 	<span {...attrs.strike}>
// 		<Markdown syntax={syntax}>
// 			{children}
// 		</Markdown>
// 	</span>
// )
//
// export const A = ({ syntax, href, children }) => (
// 	<a className="underline text-md-blue-a400" href={href} {...attrs.a}>
// 		<Markdown syntax={!children || syntax}>
// 			{children || syntax}
// 		</Markdown>
// 	</a>
// )
