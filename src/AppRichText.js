import React from "react"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

// Parses syntax into a start and end string.
function parseSyntax(syntax) {
	let s1 = "" // Start syntax
	let s2 = "" // End syntax
	if (syntax === null) {
		return ["", ""]
	} else if (typeof syntax === "string") {
		s1 = syntax
		s2 = syntax
	} else if (Array.isArray(syntax)) {
		s1 = syntax[0]
		// Guard end syntax:
		if (syntax.length === 2) {
			s2 = syntax[1]
		}
	}
	return [s1, s2]
}

const Markdown = ({ syntax, ...props }) => {
	const { markdown } = React.useContext(EditorContext)

	const [start, end] = parseSyntax(syntax)
	return (
		<React.Fragment>
			{(markdown && start) && (
				<span className="text-md-blue-a400" data-markdown>
					{start}
				</span>
			)}
			{props.children}
			{(markdown && end) && (
				<span className="text-md-blue-a400" data-markdown>
					{end}
				</span>
			)}
		</React.Fragment>
	)
}

const Em = ({ syntax, ...props }) => (
	<Inline className="italic" type="em" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Inline>
)

const Strong = ({ syntax, ...props }) => (
	<Inline className="font-bold" type="em" syntax={syntax}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</Inline>
)

export const Block = ({ id, type, syntax, ...props }) => (
	<div
		// DOM and VDOM ID:
		id={id}
		// DOM style:
		style={{ whiteSpace: "pre-wrap" }}
		// VDOM type:
		data-block-type={type}
		// VDOM syntax:
		data-block-syntax={JSON.stringify(syntax || null)}
		// Etc.
		{...props}
	>
		{props.children || (
			<br />
		)}
	</div>
)

export const Inline = ({ type, syntax, ...props }) => (
	<span
		// VDOM type:
		data-inline-type={type}
		// VDOM syntax:
		data-inline-syntax={JSON.stringify(syntax || null)} {...props}
	>
		{props.children}
	</span>
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
	<Block id={id} type="p">
		{props.children || (
			<br />
		)}
	</Block>
))

// Parses VDOM representations to React components.
function parseChildren(children) {
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
				{parseChildren(each.children)}
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
function convertToText(data, options = { markdown: false }) {
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
			result += (options.markdown && each.syntax) || ""
			recurse(each.children)
			result += (options.markdown && each.syntax) || ""
		}
	}
	// Iterate block elements:
	for (const each of data) {
		const [start, end] = parseSyntax(each.syntax)
		result += (options.markdown && start) || ""
		recurse(each.children)
		result += (options.markdown && end) || ""
		if (each !== data[data.length - 1]) {
			result += "\n" // EOL
		}
	}
	return result
}

const EditorContext = React.createContext()

const SafeAttributeRe = /^("[^"]+"|\[\"[^"]+"\]|null)$/

// if (!value.match(SafeAttributeRe)) {
// 	throw new Error(
// 		`Attribute data-(block|inline)-type=${value} is not safe for production; ` +
// 		`use a string, array of strings, or null`,
// 	)
// }

// Renders an editor.
const Editor = ({ data, prefs, ...props }) => {
	const ref = React.useRef()

	const [txt, setTxt] = React.useState(() => convertToText(data))
	const [gfm, setGfm] = React.useState(() => convertToText(data, { markdown: true }))

	React.useEffect(() => {
		setTxt(convertToText(data))
		setGfm(convertToText(data, { markdown: true }))
	}, [data])

	React.useEffect(() => {
		let markdown = ""
		const recurse = startNode => {
			for (const each of startNode.childNodes) {
				// <Markdown>
				if (each.nodeType === Node.ELEMENT_NODE && each.getAttribute("data-markdown")) {
					// No-op
					continue
				// Text and <br>
				} else if (each.nodeType === Node.TEXT_NODE || each.nodeName === "BR") {
					markdown += each.nodeValue || ""
					return
				// <Block>
				} else if (each.nodeType === Node.ELEMENT_NODE) {
					let start = ""
					let end = ""
					if (each.getAttribute(["data-block-syntax"]) || each.getAttribute(["data-inline-syntax"])) {
						const attribute = each.getAttribute(["data-block-syntax"]) || each.getAttribute(["data-inline-syntax"])
						;[start, end] = parseSyntax(JSON.parse(attribute))
					}
					markdown += start
					recurse(each)
					markdown += end
					if (each.getAttribute(["data-block-syntax"])) {
						markdown += "\n"
					}
				}
			}
		}
		recurse(ref.current)
		console.log({ markdown })
	}, [data])

	const { Provider } = EditorContext
	return (
		<Provider value={prefs}>

			{/* Editor */}
			{React.createElement(
				"div",
				{
					ref,

					className: "text-lg outline-none",

					style: { caretColor: "black" },

					contentEditable: !prefs.readOnly,
					suppressContentEditableWarning: !prefs.readOnly,
				},
				data.map(({ component: Component, ...each }) => (
					<Component key={each.id} id={each.id} syntax={each.syntax}>
						{parseChildren(each.children)}
					</Component>
				)),
			)}

			{/* Debugger */}
			<div className="my-6 h-64 whitespace-pre-wrap font-mono text-xs overflow-y-scroll" style={{ tabSize: 2 }}>
				{JSON.stringify(
					{
						txt,
						gfm,
						charCount: [...txt].length,
						wordCount: txt.split(/\s+/).filter(Boolean).length,
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

				{/* Button markdown */}
				<button
					className="my-6 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onPointerDown={e => e.preventDefault()}
					onClick={e => setPrefs({ ...prefs, markdown: !prefs.markdown })}
				>
					Toggle markdown: {!prefs.markdown ? "OFF" : "ON"}
				</button>

				{/* Button read-only */}
				<span className="inline-block w-3" />
				<button
					className="my-6 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onPointerDown={e => e.preventDefault()}
					onClick={e => setPrefs({ ...prefs, readOnly: !prefs.readOnly })}
				>
					Toggle read-only: {!prefs.readOnly ? "OFF" : "ON"}
				</button>

				{/* Editor */}
				<Editor data={data} prefs={prefs} />

			</div>
		</div>
	)
}

export default App
