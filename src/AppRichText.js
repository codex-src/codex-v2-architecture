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

// // Converts a React component tree to plain text. GitHub
// // Flavored Markdown (GFM) is an option.
// function convertToText(data, options = { gfm: false }) {
// 	let text = ""
// 	const recurse = data => {
// 		// No nesting:
// 		if (typeof data === "string") {
// 			text += data
// 			return
// 		// Guard <Component><br /></Component>:
// 		} else if (!Array.isArray(data)) {
// 			// No-op
// 			return
// 		}
// 		// Nesting:
// 		for (const each of data) {
// 			if (typeof each === "string") {
// 				text += each
// 				continue
// 			}
// 			if (options.gfm) {
// 				text += each.props.syntax || ""
// 			}
// 			recurse(each.props.children)
// 			if (options.gfm) {
// 				text += each.props.syntax || ""
// 			}
// 			// TODO: Add other components (not just Paragraph)
// 			if (each.type === Paragraph) {
// 				text += "\n"
// 			}
// 		}
// 	}
// 	recurse(data)
// 	return text
// }

const data = [
	{
		id: uuidv4(),
		type: "paragraph",
		component: Paragraph,
		children: [
			"This is ",
			{
				type: "strong",
				component: Strong,
				syntax: "**",
				children: "strong",
			},
		],
	},
	// {
	// 	id: uuidv4(),
	// 	type: "paragraph",
	// 	component: Paragraph,
	// 	children: [
	// 		"Hello, world!"
	// 	],
	// },
]

// const data = [
// 	((key = uuidv4()) => (
// 		<Paragraph key={key} id={key}>
// 			<Em syntax="_">
// 				em <Strong syntax="**">and</Strong>
// 			</Em>{" "}
// 			<Strong syntax="**">
// 				strong
// 			</Strong>
// 		</Paragraph>
// 	))(),
// 	((key = uuidv4()) => (
// 		<Paragraph key={key} id={key}>
// 			<br />
// 		</Paragraph>
// 	))(),
// 	((key = uuidv4()) => (
// 		<Paragraph key={key} id={key}>
// 			<Em syntax="_">
// 				em <Strong syntax="**">and</Strong>
// 			</Em>{" "}
// 			<Strong syntax="**">
// 				strong
// 			</Strong>
// 		</Paragraph>
// 	))(),
// ]

// // DEBUG
// console.log(convertToText(data))
// console.log(convertToText(data, { gfm: true }))

// Parses component objects into renderable React
// components.
function parseText(children) {
	const components = []
	const recurse = children => {
		if (typeof children === "string") {
			return children
		}
		for (const each of children) {
			if (typeof each === "string") {
				components.push(each)
				return
			}
			const { component: Component } = each
			components.push((
				<Component key={components.length} syntax={each.syntax}>
					{recurse(each.children)}
				</Component>
			))
		}
	}
	recurse(children)
	return components
}

// Parses a component object into a renderable React
// component.
function parse(data) {
	const Component = data.component
	return <Component key={data.id} id={data.id}>{parseText(data.children)}</Component>
}

// console.log(parseText(data))

// Renders an editor.
const Editor = props => {
	const Blocks = data.map(each => (
		parse(each)
	))
	console.log(Blocks)

	return (
		<div className="text-lg">

			{/* Blocks */}
			{Blocks}

			{/* Debugger */}
			<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
				{JSON.stringify(data, null, "\t")}
			</div>

		</div>
	)
}

const App = props => (
	<div className="flex flex-row justify-center">
		<div className="py-32 w-full max-w-3xl">
			<Editor />
		</div>
	</div>
)

export default App
