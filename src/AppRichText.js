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

const Markdown = ({ start, end, ...props }) => (
	<React.Fragment>
		{start && (
			<span className="text-md-blue-a400">
				{start}
			</span>
		)}
		{props.children}
		{end && (
			<span className="text-md-blue-a400">
				{end}
			</span>
		)}
	</React.Fragment>
)

const Em = ({ syntax, ...props }) => (
	<span className="italic">
		<Markdown start={syntax} end={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Strong = ({ syntax, ...props }) => (
	<span className="font-bold">
		<Markdown start={syntax} end={syntax}>
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

// Maps inline components.
const map = new Map()

;(() => {
	map["em"] = Em
	map["strong"] = Strong
})()

// Parses plain text and a formatting array into renderable
// components.
function parseText(text, formatting) {
	if (!formatting) {
		return text
	}
	let components = []
	let index = 0
	for (const f of formatting) { // Works as an else-statement
		if (f.x1 > index) {
			components.push(text.slice(index, f.x1))
		}
		components.push({ type: f.type, syntax: f.syntax, text: text.slice(f.x1, f.x2) })
		if (f === formatting.slice(-1)[0]) {
			components.push(text.slice(f.x2))
		}
		index = f.x2
	}
	return components
}

// Exports a data structure to GFM markdown.
function exportGFM(data) {
	let gfm = ""
	const parsed = data.map(each => {
		// if (each.component !== "paragraph") {
		// 	// No-op
		// 	return
		// }
		const spans = parseText(each.text, each.formatting)
		for (const span of spans) {
			if (typeof span === "string") {
				gfm += span
			} else {
				gfm += `${span.syntax}${span.text}${span.syntax}`
			}
		}
	})
	console.log({ gfm })
	return null

	// let gfm = ""
	// for (block of data) {
	// 	switch (block.component) {
	// 	case Paragraph:
	// 		gfm +=
	// 		break
	// 	}
	// 	default:
	// 		// No-op
	// 		break
	// }
	// return gfm
}

// // Exports a data structure to plain text.
// function exportText(data) {
// 	const parsed = data.map(each => (
// 		parseText(each.text, each.formatting)
// 	))
// 	console.log(parsed)
// 	return null
// }

// Renders an editor block.
const Block = ({ block: { component: Component, ...block }, ...props }) => {

	// Parse block into renderable components:
	let children = parseText(block.text, block.formatting)
	children = children.map((each, index) => {
		if (typeof each === "string") {
			return each
		}
		const Component = map[each.type]
		return <Component key={index} syntax={each.syntax}>{each.text}</Component>
	})

	return (
		<Component id={block.id}>
			{children || (
				<br />
			)}
		</Component>
	)
}

// TODO (1): Parse markdown to a data structure
// TODO (2): Parse a data structure to WYSIWYG or markdown
//
// What guarantees can we make about formatting?
// - Can we assume formatting is ordered?
// - Can x1 >= x2?
//
const data = [
	{
		id: uuidv4(),
		type: "paragraph",
		component: Paragraph,
		text: "This is em, this is bold",
		formatting: [
			{ type: "em", component: Em, syntax: "_", x1: 8, x2: 10 },
			{ type: "strong", component: Strong, syntax: "**", x1: 20, x2: 24 },
		],
	},
]

// DELETEME
exportGFM(data)

// Renders an editor.
const Editor = props => (
	<React.Fragment>

		{/* Blocks */}
		{data.map(each => (
			<Block key={each.id} block={each} />
		))}

		{/* Debugger */}
		<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
			{JSON.stringify(data, null, "\t")}
		</div>

	</React.Fragment>
)

const App = props => (
	<div className="flex flex-row justify-center">
		<div className="py-32 w-full max-w-3xl">
			<Editor />
		</div>
	</div>
)

export default App
