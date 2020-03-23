import React from "react"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

const Markdown = ({ syntax, ...props }) => (
	<React.Fragment>
		{syntax && (
			<span className="text-md-blue-a400">
				{typeof syntax === "string"
					? syntax
					: syntax.slice(0)[0]
				}
			</span>
		)}
		{props.children}
		{syntax && (
			<span className="text-md-blue-a400">
				{typeof syntax === "string"
					? syntax
					: syntax.slice(-1)[0]
				}
			</span>
		)}
	</React.Fragment>
)

const Em = ({ syntax, ...props }) => (
	<span className="italic">
		<Markdown syntax={syntax || console.error("Em: syntax={syntax} must be set")}>
			{props.children}
		</Markdown>
	</span>
)

const Strong = ({ syntax, ...props }) => (
	<span className="font-bold">
		<Markdown syntax={syntax || console.error("Strong: syntax={syntax} must be set")}>
			{props.children}
		</Markdown>
	</span>
)

const Paragraph = ({ id, ...props }) => (
	<div id={id}>
		{props.children || (
			<br />
		)}
	</div>
)

const data = [
	{
		id: uuidv4(),
		component: Paragraph,
		children: [
			{
				component: Em,
				syntax: "_",
				children: [
					"em and ",
					{
						component: Strong,
						syntax: "**",
						children: "strong",
					}
				],
			},
			// " and ",
			// {
			// 	component: Strong,
			// 	syntax: "**",
			// 	children: "strong",
			// },
		],
	},
	// {
	// 	id: uuidv4(),
	// 	component: Paragraph,
	// 	children: null,
	// },
	// {
	// 	id: uuidv4(),
	// 	component: Paragraph,
	// 	children: [
	// 		{
	// 			component: Em,
	// 			syntax: "_",
	// 			children: "em",
	// 		},
	// 		" and ",
	// 		{
	// 			component: Strong,
	// 			syntax: "**",
	// 			children: "strong",
	// 		},
	// 	],
	// },
]

// Parses component children objects into renderable React
// components.
function parseChildren(children) {
	if (children === null || typeof children === "string") {
		return children
	}
	const component = []
	for (const each of children) {
		if (each === null || typeof each === "string") {
			component.push(each)
			continue
		}
		const { component: Component } = each
		component.push((
			<Component key={component.length} syntax={each.syntax}>
				{parseChildren(each.children)}
			</Component>
		))
	}
	return component
}

// // Converts a data structure to plain text (GitHub Flavored
// // Markdown is an option).
// function convertToText(data, opts = { gfm: true }) {
// 	let text = ""
// 	const recurse = children => {
// 		if (children === null) {
// 			// No-op
// 			return
// 		} else if (typeof children === "string") {
// 			text += children
// 			return
// 		}
// 		for (const each of children) {
// 			if (typeof each === null) {
// 				// No-op
// 				continue
// 			} if (typeof each === "string") {
// 				text += each
// 				continue
// 			}
// 			if (opts.gfm) {
// 				text += each.syntax
// 			}
// 			recurse(each.children)
// 			if (opts.gfm) {
// 				text += each.syntax
// 			}
// 		}
// 	}
// 	for (const each of data) {
// 		// Paragraph ...
// 		recurse(each.children)
// 		text += "\n"
// 	}
// 	return text
// }
//
// // DELETEME
// console.log(convertToText(data))

// Renders an editor.
const Editor = props => (
	<div className="text-lg">

		{/* Blocks */}
		{data.map(({ component: Component, ...each }) => (
			<Component key={each.id} id={each.id}>
				{parseChildren(each.children)}
			</Component>
		))}

		{/* Debugger */}
		<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
			{JSON.stringify(data, null, "\t")}
		</div>

	</div>
)

const App = props => (
	<div className="flex flex-row justify-center">
		<div className="py-32 w-full max-w-3xl">
			<Editor />
		</div>
	</div>
)

export default App