import React from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

// Parses syntax into a start (s1) and end (s2) string.
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
	const prefers = React.useContext(EditorContext)

	const [s1, s2] = parseSyntax(syntax)
	return (
		<React.Fragment>
			{s1 && (
				<span className="text-md-blue-a400" style={{ display: prefers.readOnly && "none" }}>
					{s1}
				</span>
			)}
			{props.children}
			{s2 && (
				<span className="text-md-blue-a400" style={{ display: prefers.readOnly && "none" }}>
					{s2}
				</span>
			)}
		</React.Fragment>
	)
}

const Escape = ({ syntax, ...props }) => (
	<Markdown syntax={syntax} />
)

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

export const $Node = ({ id, ...props }) => (
	<div id={id} style={{ whiteSpace: "pre-wrap" }} data-node {...props}>
		{props.children || (
			<br />
		)}
	</div>
)

const Header = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-500 text-4xl">
		<Markdown syntax={syntax}>
			{toReact(data)}
		</Markdown>
	</$Node>
))

const Subheader = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-500 text-2xl">
		<Markdown syntax={syntax}>
			{toReact(data)}
		</Markdown>
	</$Node>
))

const H3 = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600 text-xl">
		<Markdown syntax={syntax}>
			{toReact(data)}
		</Markdown>
	</$Node>
))

const H4 = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600 text-lg">
		<Markdown syntax={syntax}>
			{toReact(data)}
		</Markdown>
	</$Node>
))

const H5 = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600">
		<Markdown syntax={syntax}>
			{toReact(data)}
		</Markdown>
	</$Node>
))

const H6 = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-600">
		<Markdown syntax={syntax}>
			{toReact(data)}
		</Markdown>
	</$Node>
))

const Paragraph = React.memo(({ id, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id}>
		{toReact(data) || (
			<br />
		)}
	</$Node>
))

// Parses GFM text to a VDOM representation.
function parseTextGFM(gfm) {
	if (!gfm) {
		return null
	}
	const data = []
	for (let index = 0; index < gfm.length; index++) {
		// The current character:
		const char = gfm[index]
		// The number of characters to EOL:
		const charsToEnd = gfm.length - index
		switch (true) {
		// \Escape
		case char === "\\": // Coerce
			// No-op
			data.push({
				component: Escape,
				syntax: [char],
				children: null,
			})
			continue
		// Emphasis or strong (supports alternate syntax):
		case char === "*" || char === "_":
			// **Strong** or __strong__
			if (charsToEnd >= (2 + 1 + 2) && gfm.slice(index, index + 2) === char.repeat(2)) {
				const syntax = char.repeat(2)
				const offset = gfm.slice(index + syntax.length).indexOf(syntax)
				if (offset <= 0 || gfm[index + offset] === "\\") {
					// No-op
					break
				}
				index += syntax.length
				data.push({
					component: Strong,
					syntax,
					children: parseTextGFM(gfm.slice(index, index + offset)),
				})
				index += syntax.length + offset - 1
				continue
			// _Emphasis_ or *emphasis*
			} else if (charsToEnd >= (1 + 1 + 1)) {
				const syntax = char.repeat(1)
				const offset = gfm.slice(index + syntax.length).indexOf(syntax)
				if (offset <= 0 || gfm[index + offset] === "\\") {
					// No-op
					break
				}
				index += syntax.length
				data.push({
					component: Em,
					syntax,
					children: parseTextGFM(gfm.slice(index, index + offset)),
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
			continue
		}
		// Concatenate string:
		data[data.length - 1] += char
	}
	// Return a string or an array:
	return !data.length ? data[0] : data
}

// Parses GFM to a VDOM representation.
function parseGFM(gfm) {
	const data = []
	const paragraphs = gfm.split("\n")
	// NOTE: Use an index for multiline elements
	for (let index = 0; index < paragraphs.length; index++) {
		const each = paragraphs[index]
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
				data.push({
					id: uuidv4(),
					component: [Header, Subheader, H3, H4, H5, H6][syntax[0].length - 2],
					syntax,
					children: parseTextGFM(each.slice(syntax[0].length)),
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
				children: parseTextGFM(each),
			})
			break
		}
	}
	return data
}

// Converts a VDOM representation to React components.
function toReact(children) {
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
				{toReact(each.children)}
			</Component>
		))
	}
	return components
}

// Converts a VDOM representation to a string.
function toString(data, { markdown } = { markdown: false }) {
	let str = ""
	// Recurse children:
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
	// Iterate top-level children:
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

// Renders editor blocks.
const EditorBlocks = ({ data, ...props }) => (
	data.map(({ component: Block, ...each }) => (
		<Block key={each.id} id={each.id} syntax={each.syntax} data={each.children} />
	))
)

const EditorContext = React.createContext()

// Renders an editor.
const Editor = ({ data, prefers, ...props }) => {
	const ref = React.useRef()

	// Rerender the DOM when data changes (use useLayoutEffect
	// because of contenteditable):
	React.useLayoutEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			<Provider value={prefers}>
				<EditorBlocks data={data} />
			</Provider>,
			ref.current,
		)
	}, [data, prefers])

	const [txt, setTxt] = React.useState(() => toString(data))
	const [gfm, setGfm] = React.useState(() => toString(data, { markdown: true }))

	// Lazily recompute txt and gfm (do not use
	// useLayoutEffect or useMemo):
	React.useEffect(() => {
		setTxt(toString(data))
		setGfm(toString(data, { markdown: true }))
	}, [data])

	return (
		<React.Fragment>

			{/* Editor */}
			{React.createElement(
				"div",
				{
					ref,

					className: props.className,

					style: {
						outline: "none",
						caretColor: "black",
						...props.style,
					},

					contentEditable: !prefers.readOnly,
					suppressContentEditableWarning: !prefers.readOnly,
				},
			)}

			{/* Debugger */}
			{true && (
				<div className="my-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
					{stringify({
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
						prefers,
						data,
					})}
				</div>
			)}

		</React.Fragment>
	)
}

// Maps component references to names.
const cmap = new Map()

;(() => {
	// Inline components:
	cmap[Em] = "Em"
	cmap[Strong] = "Strong"

	// Block components:
	//
	// NOTE: Use X.type because of React.memo
	cmap[Header.type] = "Header"
	cmap[Subheader.type] = "Subheader"
	cmap[H3.type] = "H3"
	cmap[H4.type] = "H4"
	cmap[H5.type] = "H5"
	cmap[H6.type] = "H6"
	cmap[Paragraph.type] = "Paragraph"
})()

function stringify(obj) {
	const data = JSON.stringify(
		obj,
		(key, value) => {
			// Non-component:
			if (key !== "component") {
				return value
			}
			// Component (guard React.memo):
			if (value.type) {
				value = value.type
			}
			return cmap[value]
		},
		"\t",
	)
	return data
}

const App = props => {
	const [data] = React.useState(() => (
		parseGFM(`# This is a _header\\_
## This is a subheader
### H3
#### H4
##### H5
###### H6

_em **and**_ **strong**

_em_ **_and_ strong**`)
	))

	const [prefers, setPrefers] = React.useState({
		readOnly: false,
	})

	return (
		<div className="flex flex-row justify-center">
			<div className="py-32 w-full max-w-3xl">

				{/* Buttons */}
				<button
					className="m-6 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onPointerDown={e => e.preventDefault()}
					onClick={e => setPrefers({ ...prefers, readOnly: !prefers.readOnly })}
				>
					Toggle read-only: {!prefers.readOnly ? "OFF" : "ON"}
				</button>

				{/* Editor */}
				<Editor className="px-6 text-lg" data={data} prefers={prefers} />

			</div>
		</div>
	)
}

export default App
