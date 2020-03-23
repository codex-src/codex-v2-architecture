import React from "react"
import uuidv4 from "uuid/v4"

const InlineTypes = {
	Strong: "strong",
	// ...
}

const BlockTypes = {
	Paragraph: "paragraph",
	// ...
}

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

const Strong = props => (
	<span className="font-bold">
		{props.children}
	</span>
)

const Paragraph = ({ id, ...props }) => (
	<div id={id}>
		{props.children || (
			<br />
		)}
	</div>
)

// Parses plain text and a formatting object into renderable
// components.
function parseText(text, formatting) {
	let components = []
	let index = 0
	// if (!formatting || !formatting.length) { // TODO: Need to decide
	// 	components = text
	// }
	for (const f of formatting) { // Works as an else-statement
		const key = components.length
		if (f.offset > index) {
			components.push(text.slice(index, f.offset))
		}
		components.push(<f.component key={key}>{text.slice(f.offset, f.offset + f.length)}</f.component>)
		if (f.offset + f.length < text.length) {
			components.push(text.slice(f.offset + f.length))
		}
		index += f.offset + f.length
	}
	console.log(components)
	return components

	// console.log(text.slice(f.offset, f.offset + f.length))
	// return "Hello, world!"
}

// Renders an editor block.
const Block = ({ block: { id, component: Component, text, formatting }, ...props }) => (
	<Component id={id}>
		{parseText(text, formatting) || (
			<br />
		)}
	</Component>
)

// TODO (1): Parse markdown to a data structure.
// TODO (2): Parse a data structure to WYSIWYG or markdown.
const data = [
	{
		id: uuidv4(),
		type: BlockTypes.Paragraph,
		component: Paragraph,
		text: "Hello, world!",
		formatting: [ // What assumptions can we make about formatting? Can we assume formatting is ordered?
			{ type: InlineTypes.Strong, component: Strong, offset: 7, length: 5 },
			// { type: InlineTypes.Strong, component: Strong, offset: 7, length: 5 },
			// { type: InlineTypes.Strong, component: Strong, offset: 7, length: 5 },
		],
	},
	// {
	// 	id: uuidv4(),
	// 	type: BlockTypes.Paragraph,
	// 	component: Paragraph,
	// 	text: "Hello, world!",
	// 	formatting: [{ type: InlineTypes.Strong, component: Strong, offset: 7, length: 5 }],
	// },
	// {
	// 	id: uuidv4(),
	// 	type: BlockTypes.Paragraph,
	// 	component: Paragraph,
	// 	text: "Hello, world!",
	// 	formatting: [{ type: InlineTypes.Strong, component: Strong, offset: 7, length: 5 }],
	// },
]

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
