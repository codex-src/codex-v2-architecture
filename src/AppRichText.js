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
				{syntax.slice(0)[0]}
			</span>
		)}
		{props.children}
		{syntax && (
			<span className="text-md-blue-a400">
				{syntax.slice(-1)[0]}
			</span>
		)}
	</React.Fragment>
)

const Em = ({ syntax, ...props }) => (
	<span className="italic">
		{/* <Markdown syntax={syntax}> */}
			{props.children}
		{/* </Markdown> */}
	</span>
)

const Strong = ({ syntax, ...props }) => (
	<span className="font-bold">
		{/* <Markdown syntax={syntax}> */}
			{props.children}
		{/* </Markdown> */}
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
// const componentMap = new Map()
//
// ;(() => {
// 	componentMap.em = Em
// 	componentMap.strong = Strong
// })()

const componentMap = new Map()

;(() => {
	componentMap["strong"] = Strong
	componentMap["em"] = Em
})()

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

function parseText(spans) {
	const components = spans.map((each, index) => {
		if (typeof each === "string") {
			return each
		}
		let Component = null
		let syntax = null
		if (each.attr.strong) {
			syntax = each.attr.strong
			Component = componentMap.strong
		} else if (each.attr.em) {
			syntax = each.attr.em
			Component = componentMap.em
		}
		return <Component key={index} syntax={syntax}>{each.text}</Component>
	})
	return components
}

// // Converts a data structure to plain text or GitHub
// // Flavored Markdown (GFM).
// function convertToText(data, markdown) {
// 	let str = ""
// 	for (const block of data) {
// 		// TODO: Add support non-paragraph blocks
// 		const { text, formatting } = block
// 		if (!formatting) {
// 			str += text
// 			continue
// 		}
// 		const spans = parseText(text, formatting)
// 		for (const span of spans) {
// 			const { start, end, text } = span
// 			if (typeof span === "string") {
// 				str += span
// 				continue
// 			}
// 			str += `${!markdown ? "" : start || ""}${text}${!markdown ? "" : end || ""}`
// 		}
// 	}
// 	return str
// }

// Renders an editor block.
const Block = ({ block, ...props }) => (
	<Paragraph id={block.id}>
		{parseText(block.spans) || (
			<br />
		)}
	</Paragraph>
)

// TODO (1): Parse markdown to a data structure
// TODO (2): Parse a data structure to WYSIWYG or markdown
//
// What guarantees can we make about formatting?
// - Can we assume formatting is ordered?
// - Can x1 >= x2?
// - Can x1 === x2? We don’t want this
const data = {
	blocks: [
		{
			id: uuidv4(),
			type: "paragraph",
			component: Paragraph,
			spans: [
				{
					text: "em ",
					attr: {
						code: 0,
						em: ["_"],
						strike: 0,
						strong: 0,
					},
				},
				{
					text: "and",
					attr: {
						code: 0,
						em: ["_"],
						strike: 0,
						strong: ["**"],
					},
				},
				" ",
				{
					text: "strong",
					attr: {
						code: 0,
						em: 0,
						strike: 0,
						strong: ["**"],
					},
				},
			]
		},
	],
}

// em and strong
//
// <em>
// 	em{" "}
// 	<strong>
// 		and
// 	</strong>
// </em>
// {" "}
// strong

// // DELETEME
// console.log(convertToText(data, false))
// console.log(convertToText(data, true))

// Renders an editor.
const Editor = props => (
	<div className="text-lg">

		{/* Blocks */}
		{data.blocks.map(each => (
			<Block key={each.id} block={each} />
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
