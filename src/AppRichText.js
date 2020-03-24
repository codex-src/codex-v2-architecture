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
	const { readOnly } = React.useContext(EditorContext)

	const [s1, s2] = parseSyntax(syntax)
	return (
		<React.Fragment>
			{s1 && (
				<span className="text-md-blue-a400" style={{ display: readOnly && "none" }}>
					{s1}
				</span>
			)}
			{props.children}
			{s2 && (
				<span className="text-md-blue-a400" style={{ display: readOnly && "none" }}>
					{s2}
				</span>
			)}
		</React.Fragment>
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

export const $Node = ({ id, type, syntax, ...props }) => (
	<div id={id} style={{ whiteSpace: "pre-wrap" }} data-node {...props}>
		{props.children || (
			<br />
		)}
	</div>
)

const Header = React.memo(({ id, syntax, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-500 text-4xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</$Node>
))

const Subheader = React.memo(({ id, syntax, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-500 text-2xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</$Node>
))

const H3 = React.memo(({ id, syntax, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600 text-xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</$Node>
))

const H4 = React.memo(({ id, syntax, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600 text-lg">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</$Node>
))

const H5 = React.memo(({ id, syntax, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</$Node>
))

const H6 = React.memo(({ id, syntax, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</$Node>
))

const Paragraph = React.memo(({ id, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id}>
		{props.children || (
			<br />
		)}
	</$Node>
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
	// Return a string or an array:
	return !data.length ? data[0] : data
}

// Parses markdown (GFM) to a VDOM representation.
function parseMarkdown(text) {
	const data = []
	const paragraphs = text.split("\n")
	for (let index = 0; index < paragraphs.length; index++) {
		const each = paragraphs[index] // Shorthand
		// const char = each.charAt(0) // Shorthand
		switch (each.charAt(0)) {
		// # Header:
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

// Converts an editor data structure to plain text.
function toString(data, { markdown } = { markdown: false }) {
	let str = ""
	// Recurse inline elements:
	const recurse = children => {
		if (children === null || typeof children === "string") {
			str += children || ""
			return
		}
		for (const each of children) {
			if (each === null || typeof each === "string") {
				str += each || ""
				continue
			}
			str += (markdown && each.syntax) || ""
			recurse(each.children)
			str += (markdown && each.syntax) || ""
		}
	}
	// Iterate block elements:
	for (const each of data) {
		const [s1, s2] = parseSyntax(each.syntax)
		str += (markdown && s1) || ""
		recurse(each.children)
		str += (markdown && s2) || ""
		if (each !== data[data.length - 1]) {
			str += "\n" // EOL
		}
	}
	return str
}

// Recursively reads from an element.
function innerText(element) {
	let str = ""
	const recurse = element => {
		for (const each of element.childNodes) {
			// Text and <br>:
			if (each.nodeType === Node.TEXT_NODE || each.nodeName === "BR") {
				str += each.nodeValue || ""
			// <Any>:
			} else if (each.nodeType === Node.ELEMENT_NODE) {
				recurse(each)
				if (each.getAttribute("data-node") || each.getAttribute("data-compound-node")) {
					str += "\n"
				}
			}
		}
	}
	recurse(element)
	return str
}

const EditorContext = React.createContext()

// Renders a Codex editor.
const Editor = ({ data, prefs, ...props }) => {
	const ref = React.useRef()

	const txt = React.useMemo(() => toString(data), [data])
	const gfm = React.useMemo(() => toString(data, { markdown: true }), [data])

	// React.useEffect(() => {
	// 	console.log(innerText(ref.current))
	// }, [data])

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
						txt: {
							data: txt,
							characters: [...txt].length,
							words: txt.split(/\s+/).filter(Boolean).length,
						},
						gfm: {
							data: gfm,
							characters: [...gfm].length,
							words: gfm.split(/\s+/).filter(Boolean).length,
						},
						prefs,
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
	const [data] = React.useState(() => (
		parseMarkdown(`# This is a header
## This is a subheader
### H3
#### H4
##### H5
###### H6

_em **and**_ **strong**

_em_ **_and_ strong**`)
	))

	const [prefs, setPrefs] = React.useState(() => ({
		readOnly: false,
	}))

	return (
		<div className="flex flex-row justify-center">
			<div className="py-32 w-full max-w-3xl">

				{/* Buttons */}
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
