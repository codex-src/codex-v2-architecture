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
		<React.Fragment>
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
		</React.Fragment>
	)
}

const Em = ({ syntax, ...props }) => (
	<span className="italic" data-inline="em">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Strong = ({ syntax, ...props }) => (
	<span className="font-bold" data-inline="strong">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

export const Block = ({ id, type, syntax, ...props }) => (
	<div
		// DOM and VDOM ID:
		id={id}
		// DOM style:
		style={{ whiteSpace: "pre-wrap" }}
		// VDOM type:
		data-type={type}
		// VDOM syntax:
		data-syntax={JSON.stringify(syntax || null)} {...props}
	>
		{props.children || (
			<br />
		)}
	</div>
)

const H1 = React.memo(({ id, syntax, ...props }) => (
	<Block id={id} className="font-500 text-4xl" type="h1" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Block>
))

const H2 = React.memo(({ id, syntax, ...props }) => (
	<Block id={id} className="font-500 text-2xl" type="h2" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Block>
))

const H3 = React.memo(({ id, syntax, ...props }) => (
	<Block id={id} className="font-600 text-xl" type="h3" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Block>
))

const H4 = React.memo(({ id, syntax, ...props }) => (
	<Block id={id} className="font-600 text-lg" type="h4" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Block>
))

const H5 = React.memo(({ id, syntax, ...props }) => (
	<Block id={id} className="font-600" type="h5" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Block>
))

const H6 = React.memo(({ id, syntax, ...props }) => (
	<Block id={id} className="font-600" type="h6" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Block>
))

const Paragraph = React.memo(({ id, ...props }) => (
	<Block id={id} data-type="p">
		{props.children || (
			<br />
		)}
	</Block>
))

// Parses VDOM representations of spans to React components.
function parseSpansReact(children) {
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
				{parseSpansReact(each.children)}
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
		// H1:
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
					component: [H1, H2, H3, H4, H5, H6][syntax[0].length - 2],
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
// 		component: H1,
// 		syntax: ["# "],
// 		children: "This is a header",
// 	},
// 	{
// 		id: uuidv4(),
// 		component: H2,
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
const Editor = ({ data, prefs, ...props }) => {
	const text = convertToText(data, { markdown: false })
	const textGFM = convertToText(data, { markdown: true })

	const { Provider } = EditorContext
	return (
		<Provider value={prefs}>

			{React.createElement(
				"div",
				{
					className: "text-lg outline-none",

					contentEditable: !prefs.readOnly,
				},
				data.map(({ component: Component, ...each }) => (
					<Component key={each.id} id={each.id} syntax={each.syntax}>
						{parseSpansReact(each.children)}
					</Component>
				)),
			)}

			<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
				{JSON.stringify(
					{
						text,
						textGFM,
						charCount: [...text].length,
						wordCount: text.split(/\s+/).filter(Boolean).length,
						prefs, // Takes precedence?
						data,
					},
					null,
					"\t",
				)}
			</div>

		</Provider>
	)
}

const App = props => {
	const [data] = React.useState(() => {
		return parseMarkdown(raw, { markdown: true })
	})

	const [prefs, setPrefs] = React.useState(() => ({
		markdown: true,
		readOnly: true,
	}))

	return (
		<div className="flex flex-row justify-center">
			<div className="py-32 w-full max-w-3xl">
				<button
					className="my-6 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow transition duration-150"
					onPointerDown={e => e.preventDefault()}
					onClick={e => setPrefs(current => ({ ...current, markdown: !current.markdown }))}
				>
					Toggle markdown: {!prefs.markdown ? "OFF" : "ON"}
				</button>
				<span className="inline-block w-3" />
				<button
					className="my-6 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow transition duration-150"
					onPointerDown={e => e.preventDefault()}
					onClick={e => setPrefs(current => ({ ...current, readOnly: !current.readOnly }))}
				>
					Toggle read-only: {!prefs.readOnly ? "OFF" : "ON"}
				</button>
				<Editor data={data} prefs={prefs} />
			</div>
		</div>
	)
}

export default App
