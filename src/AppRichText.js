import React from "react"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

const Markdown = ({ syntax, ...props }) => {
	const { markdown } = React.useContext(EditorContext)

	let start = ""
	let end = ""
	if (typeof syntax === "string") {
		start = syntax
		end = syntax
	} else if (Array.isArray(syntax)) {
		;[start, end] = syntax
	}

	return (
		// TODO: Move data-syntax to host component?
		<span data-syntax={JSON.stringify(syntax)}>
			{(markdown && start) && (
				<span className="text-md-blue-a400">
					{start}
				</span>
			)}
			{props.children}
			{(markdown && end) && (
				<span className="text-md-blue-a400">
					{end}
				</span>
			)}
		</span>
	)
}

const Em = ({ syntax, ...props }) => (
	<span className="italic">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Strong = ({ syntax, ...props }) => (
	<span className="font-bold">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Header = React.memo(({ id, syntax, ...props }) => (
	<div id={id} className="font-medium text-4xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
))
const Subheader = React.memo(({ id, syntax, ...props }) => (
	<div id={id} className="font-medium text-2xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
))
const H3 = React.memo(({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold text-xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
))
const H4 = React.memo(({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold text-lg">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
))
const H5 = React.memo(({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
))
const H6 = React.memo(({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
))

const Paragraph = React.memo(({ id, ...props }) => (
	<div id={id}>
		{props.children || (
			<br />
		)}
	</div>
))

// Parses span VDOM representations to React components.
function parseSpans(children) {
	if (children === null || typeof children === "string") {
		return children
	}
	const components = []
	for (const each of children) {
		if (each === null || typeof each === "string") {
			components.push(each)
			continue
		}
		const { component: Component } = each
		components.push((
			<Component key={components.length} syntax={each.syntax}>
				{parseSpans(each.children)}
			</Component>
		))
	}
	return components
}

// Parses markdown text (GFM) to a VDOM representation.
function parseMarkdownText(text) {
	if (!text) {
		return null
	}
	const data = []
	for (let index = 0; index < text.length; index++) {
		const char = text[index]         // Shortcut
		const numCharsToEnd = text.length - index // Shortcut
		switch (true) {
		// Emphasis or strong:
		case char === "*" || char === "_":
			if (numCharsToEnd >= (4 + 1) && text.slice(index, index + 2) === char.repeat(2)) {
				const syntax = char.repeat(2)
				const offset = text.slice(index + syntax.length).indexOf(syntax)
				if (offset <= 0) {
					// No-op
					break
				}
				index += syntax.length
				const children = parseMarkdownText(text.slice(index, index + offset))
				data.push({
					component: Strong,
					syntax,
					children,
				})
				index += syntax.length + offset - 1
				continue
			// *Emphasis*
			} else if (numCharsToEnd >= (2 + 1)) {
				const syntax = char.repeat(1)
				const offset = text.slice(index + syntax.length).indexOf(syntax)
				if (offset <= 0) {
					// No-op
					break
				}
				index += syntax.length
				const children = parseMarkdownText(text.slice(index, index + offset))
				data.push({
					component: Em,
					syntax,
					children,
				})
				index += offset + syntax.length - 1
				continue
			}
			break
		default:
			// No-op
			break
		}
		// Push string:
		if (!data.length || typeof data[data.length - 1] !== "string") {
			data.push(char)
		// OR Concatenate string:
		} else {
			data[data.length - 1] += char
		}
	}
	// Return a string instead of an array:
	if (data.length === 1) {
		return data[0]
	}
	// Return an array:
	return data
}

// Parses markdown (GFM) to a VDOM representation.
function parseMarkdown(text) {
	const data = []
	const paragraphs = text.split("\n")
	for (let index = 0; index < paragraphs.length; index++) {
		const each = paragraphs[index] // Shorthand
		// const char = each.charAt(0) // Shorthand
		switch (each.charAt(0)) {
		// Header:
		case "#":
			if (
				(each.length >= 2 && each.slice(0, 2) === "# ") ||
				(each.length >= 3 && each.slice(0, 3) === "## ") ||
				(each.length >= 4 && each.slice(0, 4) === "### ") ||
				(each.length >= 5 && each.slice(0, 5) === "#### ") ||
				(each.length >= 6 && each.slice(0, 6) === "##### ") ||
				(each.length >= 7 && each.slice(0, 7) === "###### ")
			) {
				const syntax = [each.slice(0, each.indexOf(" ") + 1)]
				const children = each.slice(syntax[0].length) // TODO
				data.push({
					id: uuidv4(),
					// NOTE: Use ... - 2 for zero-based and space
					component: [Header, Subheader, H3, H4, H5, H6][syntax[0].length - 2],
					syntax,
					children,
				})
				continue
			}
			break
		default:
			// No-op
			data.push({
				id: uuidv4(),
				component: Paragraph,
				syntax: null,
				children: parseMarkdownText(each),
			})
			break
		}
	}
	return data
}

// Supposed to be a markdown (GFM) representation of data.
const raw = `# This is a header
## This is a subheader
### H3
#### H4
##### H5
###### H6

_em **and**_ **strong**

_em_ **_and_ strong**`

// const data = [
// 	{
// 		id: uuidv4(),
// 		component: Header,
// 		syntax: ["# "],
// 		children: "This is a header",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: Subheader,
// 		syntax: ["## "],
// 		children: "This is a subheader",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: H3,
// 		syntax: ["### "],
// 		children: "H3",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: H4,
// 		syntax: ["#### "],
// 		children: "H4",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: H5,
// 		syntax: ["##### "],
// 		children: "H5",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: H6,
// 		syntax: ["###### "],
// 		children: "H6",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: Paragraph,
// 		syntax: null,
// 		children: null,
// 	},
// 	{
// 		id: uuidv4(),
// 		component: Paragraph,
// 		syntax: null,
// 		children: [
// 			{
// 				component: Em,
// 				syntax: "_",
// 				children: [
// 					"em ",
// 					{
// 						component: Strong,
// 						syntax: "**",
// 						children: "and",
// 					},
// 				],
// 			},
// 			" ",
// 			{
// 				component: Strong,
// 				syntax: "**",
// 				children: "strong",
// 			},
// 		],
// 	},
// 	{
// 		id: uuidv4(),
// 		component: Paragraph,
// 		syntax: null,
// 		children: null,
// 	},
// 	{
// 		id: uuidv4(),
// 		component: Paragraph,
// 		syntax: null,
// 		children: [
// 			{
// 				component: Em,
// 				syntax: "_",
// 				children: "em",
// 			},
// 			" ",
// 			{
// 				component: Strong,
// 				syntax: "**",
// 				children: [
// 					{
// 						component: Em,
// 						syntax: "_",
// 						children: "and",
// 					},
// 					" strong",
// 				],
// 			},
// 		],
// 	},
// ]

// // TESTING
// console.log(parseMarkdown(raw))

// Converts a data structure to plain text (GitHub Flavored
// Markdown is an option).
function convertToText(data, { markdown }) {
	let result = ""
	// Recurse inline elements:
	const recurse = children => {
		if (children === null || typeof children === "string") {
			result += children || ""
			return
		}
		for (const each of children) {
			if (each === null || typeof each === "string") {
				result += each || ""
				continue
			}
			result += (markdown && each.syntax) || ""
			recurse(each.children)
			result += (markdown && each.syntax) || ""
		}
	}
	// Iterate block elements:
	for (const each of data) {
		// (Code based on <Markdown>)
		const { syntax } = each
		let start = ""
		let end = ""
		if (typeof syntax === "string") {
			start = syntax
			end = syntax
		} else if (Array.isArray(syntax)) {
			;[start, end] = syntax
		}
		result += (markdown && start) || ""
		recurse(each.children)
		result += (markdown && end) || ""
		if (each !== data[data.length - 1]) {
			result += "\n" // EOL
		}
	}
	return result
}

const EditorContext = React.createContext()

// Renders an editor.
const Editor = ({ data, markdown, ...props }) => {
	const text = convertToText(data, { markdown: false })
	const textGFM = convertToText(data, { markdown: true })

	const { Provider } = EditorContext
	return (
		<Provider value={{ markdown: markdown === true /* Coerce */ }}>
			<div className="text-lg">

				{data.map(({ component: Component, ...each }) => (
					<Component key={each.id} id={each.id} syntax={each.syntax}>
						{parseSpans(each.children)}
					</Component>
				))}

				<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
					{JSON.stringify(
						{
							text,
							textGFM,
							charCount: [...text].length,
							wordCount: text.split(/\s+/).filter(Boolean).length,
							data,
						},
						null,
						"\t",
					)}
				</div>

			</div>
		</Provider>
	)
}

const App = props => {
	const [data /* , setData */] = React.useState(() => {
		return parseMarkdown(raw, { markdown: true })
	})

	const [markdown, setMarkdown] = React.useState(true)

	return (
		<div className="flex flex-row justify-center">
			<div className="py-32 w-full max-w-3xl">
				<button className="my-6 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow transition duration-150" onPointerDown={e => e.preventDefault()} onClick={e => setMarkdown(!markdown)}>
					Toggle markdown
				</button>
				<Editor data={data} markdown={markdown} />
			</div>
		</div>
	)
}

export default App
