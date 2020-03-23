import React from "react"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

const Markdown = ({ syntax, ...props }) => {
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
}

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

const Header = ({ id, syntax, ...props }) => (
	<div id={id} className="font-medium text-4xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
)
const Subheader = ({ id, syntax, ...props }) => (
	<div id={id} className="font-medium text-2xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
)
const H3 = ({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold text-xl">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
)
const H4 = ({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold text-lg">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
)
const H5 = ({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
)
const H6 = ({ id, syntax, ...props }) => (
	<div id={id} className="font-semibold">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</div>
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
		component: Header,
		syntax: ["# "],
		children: "This is a header",
	},
	{
		id: uuidv4(),
		component: Subheader,
		syntax: ["## "],
		children: "This is a subheader",
	},
	{
		id: uuidv4(),
		component: H3,
		syntax: ["### "],
		children: "H3",
	},
	{
		id: uuidv4(),
		component: H4,
		syntax: ["#### "],
		children: "H4",
	},
	{
		id: uuidv4(),
		component: H5,
		syntax: ["##### "],
		children: "H5",
	},
	{
		id: uuidv4(),
		component: H6,
		syntax: ["###### "],
		children: "H6",
	},
	{
		id: uuidv4(),
		component: Paragraph,
		syntax: null,
		children: null,
	},
	{
		id: uuidv4(),
		component: Paragraph,
		syntax: null,
		children: [
			{
				component: Em,
				syntax: "_",
				children: [
					"em ",
					{
						component: Strong,
						syntax: "**",
						children: "and",
					},
				],
			},
			" ",
			{
				component: Strong,
				syntax: "**",
				children: "strong",
			},
		],
	},
	{
		id: uuidv4(),
		component: Paragraph,
		syntax: null,
		children: null,
	},
	{
		id: uuidv4(),
		component: Paragraph,
		syntax: null,
		children: [
			{
				component: Em,
				syntax: "_",
				children: "em",
			},
			" ",
			{
				component: Strong,
				syntax: "**",
				children: [
					{
						component: Em,
						syntax: "_",
						children: "and",
					},
					" strong",
				],
			},
		],
	},
]

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

const raw = "# This is a header\n## This is a subheader\n### H3\n#### H4\n##### H5\n###### H6\n\n_em **and**_ **strong**\n\n_em_ **_and_ strong**"

// Parses markdown spans (GFM) to a VDOM representation.
function parseTextVDOM(markdown) {
	if (!markdown) {
		return null
	}
	const data = []
	for (let index = 0; index < markdown.length; index++) {
		const char = markdown[index]         // Shortcut
		const numCharsToEnd = markdown.length - index // Shortcut
		switch (true) {
		// Emphasis or strong:
		case char === "*" || char === "_":
			if (numCharsToEnd >= (4 + 1) && markdown.slice(index, index + 2) === char.repeat(2)) {
				const syntax = char.repeat(2)
				const offset = markdown.slice(index + syntax.length).indexOf(syntax)
				if (offset <= 0) {
					// No-op
					break
				}
				index += syntax.length
				const children = parseTextVDOM(markdown.slice(index, index + offset))
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
				const offset = markdown.slice(index + syntax.length).indexOf(syntax)
				if (offset <= 0) {
					// No-op
					break
				}
				index += syntax.length
				const children = parseTextVDOM(markdown.slice(index, index + offset))
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
	return data
}

// Parses markdown (GFM) to a VDOM representation.
function parseVDOM(markdown) {
	const data = []
	const paragraphs = markdown.split("\n")
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
					key: uuidv4(),
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
				key: uuidv4(),
				component: Paragraph,
				syntax: null,
				children: parseTextVDOM(each),
			})
			break
		}
	}
	return data
}

// TESTING
console.log(parseVDOM(raw))

// Converts a data structure to plain text (GitHub Flavored
// Markdown is an option).
function convertToText(data, { gfm }) {
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
			result += (gfm && each.syntax) || ""
			recurse(each.children)
			result += (gfm && each.syntax) || ""
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
		result += (gfm && start) || ""
		recurse(each.children)
		result += (gfm && end) || ""
		if (each !== data[data.length - 1]) {
			result += "\n" // EOL
		}
	}
	return result
}

// Renders an editor.
const Editor = props => {
	const text = convertToText(data, { gfm: false })
	const markdown = convertToText(data, { gfm: true })

	return (
		<div className="text-lg">

			{/* Blocks */}
			{data.map(({ component: Component, ...each }) => (
				<Component key={each.id} id={each.id} syntax={each.syntax}>
					{parseSpans(each.children)}
				</Component>
			))}

			{/* Debugger */}
			<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
				{JSON.stringify({
					text,
					markdown,
					charCount: [...text].length,
					wordCount: text.split(/\s+/).filter(Boolean).length,
					data,
				}, null, "\t")}
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
