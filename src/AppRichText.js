import React from "react"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

// const InlineTypes = {
// 	Strong: "strong",
// 	// ...
// }
//
// const BlockTypes = {
// 	Paragraph: "paragraph",
// 	// ...
// }

// const markdown = `Hello, world!\n\nHello, darkness…`
//
// // Parses a plain text value into a data structure.
// function parse(value) {
// 	const data = value.split("\n").map(each => ({
// 		id: uuidv4(),
// 		// TODO: Change API to left, top or x, y?
// 		cursor: {
// 			active: false,
// 			x1: 0, // NOTE: -1 refers to the end
// 			x2: 0, // NOTE: -1 refers to the end
// 		},
// 		value: each,
// 	}))
// 	return data
// }

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

// // Maps inline components.
// const map = new Map()
//
// ;(() => {
// 	map.em = Em
// 	map.strong = Strong
// })()

// // Parses plain text and a formatting array into renderable
// // components.
// function parseText(text, formatting) {
// 	if (!formatting) {
// 		return text
// 	}
// 	const components = []
// 	let index = 0
// 	for (const f of formatting) { // Works as an else-statement
// 		const { type, start, end, x1, x2 } = f
// 		if (x1 > index) {
// 			components.push(text.slice(index, x1))
// 		}
// 		components.push({ type, start, end, text: text.slice(x1, x2) })
// 		if (f === formatting.slice(-1)[0]) {
// 			components.push(text.slice(x2))
// 		}
// 		index = x2
// 	}
// 	return components
// }

// Converts a React component tree to plain text. GitHub
// Flavored Markdown (GFM) is an option.
function convertToText(data, options = { gfm: false }) {
	let str = ""
	const recurse = data => {
		// No nesting:
		if (typeof data === "string") {
			str += data
			return
		// Guard <Component><br /></Component>:
		} else if (!Array.isArray(data)) {
			// No-op
			return
		}
		// Nesting:
		for (const each of data) {
			if (typeof each === "string") {
				str += each
				continue
			}
			if (options.gfm) {
				str += each.props.syntax || ""
			}
			recurse(each.props.children)
			if (options.gfm) {
				str += each.props.syntax || ""
			}
			// TODO: Add other components (not just Paragraph)
			if (each.type === Paragraph) {
				str += "\n"
			}
		}
	}
	recurse(data)
	return str
}

const data = [
	((key = uuidv4()) => (
		<Paragraph key={key} id={key}>
			<Em syntax="_">
				em <Strong syntax="**">and</Strong>
			</Em>{" "}
			<Strong syntax="**">
				strong
			</Strong>
		</Paragraph>
	))(),
	((key = uuidv4()) => (
		<Paragraph key={key} id={key}>
			<br />
		</Paragraph>
	))(),
	((key = uuidv4()) => (
		<Paragraph key={key} id={key}>
			<Em syntax="_">
				em <Strong syntax="**">and</Strong>
			</Em>{" "}
			<Strong syntax="**">
				strong
			</Strong>
		</Paragraph>
	))(),
]

// DEBUG
console.log(convertToText(data, { gfm: true }))

// Renders an editor.
const Editor = props => (
	<div className="text-lg">

		{/* Blocks */}
		{data}

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
