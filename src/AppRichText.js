import escape from "lodash/escape"
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

const Syntax = ({ className, style, readOnly, ...props }) => (
	<span className={className || "text-md-blue-a400"} style={{ ...style, display: readOnly && "none" }}>
		{props.children}
	</span>
)

const Markdown = ({ className, style, syntax, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	const [start, end] = parseSyntax(syntax)
	return (
		<React.Fragment>
			{start && (
				<Syntax
					className={className}
					readOnly={readOnly}
					children={start}
				/>
			)}
			{props.children}
			{end && (
				<Syntax
					className={className}
					readOnly={readOnly}
					children={end}
				/>
			)}
		</React.Fragment>
	)
}

const Escape = ({ syntax, ...props }) => (
	// NOTE: Can drop <span>
	<span>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Em = ({ syntax, ...props }) => (
	<span className="italic">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Strong = ({ syntax, ...props }) => (
	<span className="font-semibold">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const StrongAndEm = ({ syntax, ...props }) => (
	<span className="font-semibold italic">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Code = ({ syntax, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	return (
		// NOTE: Do not use text-sm because of rem
		<span className="py-px font-mono text-red-600 bg-red-100 rounded" style={{ fontSize: "0.875em" }}>
			<Markdown className="text-red-600" syntax={syntax}>
				{!readOnly ? (
					props.children
				) : (
					props.children.trim()
				)}
			</Markdown>
		</span>
	)
}

const Strike = ({ syntax, ...props }) => (
	<span className="line-through">
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

// FIXME: Warning: validateDOMNesting(...): <a> cannot
// appear as a descendant of <a>.
const A = ({ syntax, ...props }) => (
	// TODO: Use <span>?
	<a className="underline text-md-blue-a400" href={syntax + props.children}>
		<Markdown syntax={!props.children || syntax}>
			{props.children || syntax}
		</Markdown>
	</a>
)

export const $Node = ({ id, ...props }) => (
	<div id={id} style={{ whiteSpace: "pre-wrap" }} data-node {...props}>
		{props.children || (
			<br />
		)}
	</div>
)

const H1 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-medium text-4xl leading-base">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(data)}
			</Markdown>
		</a>
	</$Node>
))

const H2 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-medium text-2xl leading-base">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(data)}
			</Markdown>
		</a>
	</$Node>
))

const H3 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold text-xl leading-base">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(data)}
			</Markdown>
		</a>
	</$Node>
))

const H4 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold text-lg leading-base">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(data)}
			</Markdown>
		</a>
	</$Node>
))

const H5 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold leading-base">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(data)}
			</Markdown>
		</a>
	</$Node>
))

const H6 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold leading-base">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toReact(data)}
			</Markdown>
		</a>
	</$Node>
))

const Paragraph = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id}>
		{toReact(data) || (
			<br />
		)}
	</$Node>
))

const Break = React.memo(({ id, syntax, data, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	return (
		// eslint-disable-next-line react/jsx-pascal-case
		<$Node id={id}>
			{!readOnly ? (
				<Markdown syntax={syntax} />
			) : (
				// NOTE: Use 25% to center; 15% matches --- but not
				// *** syntax
				<hr className="inline-block w-full" style={{ verticalAlign: "15%" }} />
			)}
		</$Node>
	)
})

// Registers a type for parseTextGFM.
function registerType(type, syntax, { recurse } = { recurse: true }) {
	// NOTE: Escape syntax for regex
	const escapedSyntax = syntax.split("").map(each => `\\${each}`).join("")
	// const searchRe = `[^\\\\]${escapedSyntax}( |$)` // FIXME: N/A code
	let searchRe = `[^\\\\]${escapedSyntax}`
	if (syntax[0] === "_") {
		searchRe = `[^\\\\]${escapedSyntax}( |$)`
	}
	const parse = (text, index) => {
		// Get the nearest offset proceeded by a space or EOL:
		//
		// NOTE: Use ... + 1 because of escape character
		const offset = text.slice(index + syntax.length).search(searchRe) + 1 // text.slice(index + syntax.length).indexOf(syntax)
		if (
			(syntax !== "`" && text[index + syntax.length] === " ") || // Exempt code
			offset <= 0 ||
			(syntax !== "`" && text[index + syntax.length + offset - 1] === " ") // Exempt code
		) {
			return null
		}
		index += syntax.length
		const str = text.slice(index, index + offset)
		const object = {
			type,
			syntax,
			children: !recurse ? str : parseTextGFM(str),
		}
		index += syntax.length + offset - 1
		return { object, x2: index }
	}
	return parse
}

// const HTTPS  = "https://"  // eslint-disable-line no-multi-spaces
// const HTTPSX = "https://x" // eslint-disable-line no-multi-spaces
// const HTTP   = "http://"   // eslint-disable-line no-multi-spaces
// const HTTPX  = "http://x"  // eslint-disable-line no-multi-spaces

const HTTPS = "https://"
const HTTP = "http://"

// Parses GFM text to a VDOM representation.
//
// TODO: Can extract registerType(...)(...) to
// parseStrongAndEm(...)
function parseTextGFM(text) {
	if (!text) {
		return null
	}
	const data = []
	for (let index = 0; index < text.length; index++) {
		const char = text[index]
		const nchars = text.length - index
		switch (true) {
		// <Escape>
		case char === "\\":
	 		if (index + 1 < text.length && text[index + 1].match(/[\W_]/)) {
				// No-op
				data.push({
					type: Escape,
					syntax: [char],
					children: text[index + 1],
				})
				index++
				continue
			}
			break
		// <StrongEm> or <Strong> or <Em>
		case char === "*" || char === "_":
			// ***Strong and em***
			if (nchars >= "***x***".length && text.slice(index, index + 3) === char.repeat(3)) {
				const parsed = registerType(StrongAndEm, char.repeat(3))(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			// **Strong** or __strong__
			} else if (nchars >= "**x**".length && text.slice(index, index + 2) === char.repeat(2)) {
				const parsed = registerType(Strong, char.repeat(2))(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			// _Emphasis_ or *emphasis*
			} else if (nchars >= "*x*".length) {
				const parsed = registerType(Em, char)(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			}
			break
		// <Strike>
		case char === "~":
			// ~~Strike~~
			if (nchars >= "~~x~~".length && text.slice(index, index + 2) === "~~") {
				const parsed = registerType(Strike, "~~")(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			// ~Strike~
			} else if (nchars >= "~x~".length) {
				const parsed = registerType(Strike, "~")(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			}
			break
		// <Code>
		case char === "`":
			if (nchars >= "`x`".length) {
				const parsed = registerType(Code, "`", { recurse: false })(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			}
			break
		// <A>
		//
		// TODO: Use punycode for URLs?
		//
		// https://stackoverflow.com/a/1547940
		case char === "h":
			// https://
			if (nchars >= HTTPS.length && text.slice(index, index + HTTPS.length) === HTTPS) {
				// TODO: Check other whitespace characters? E.g. \s
				let offset = text.slice(index + HTTPS.length).indexOf(" ")
				if (offset === -1) {
					// Set offset to EOL:
					offset = nchars - HTTPS.length
				}
				data.push({
					type: A,
					syntax: [HTTPS],
					children: text.slice(index + HTTPS.length, index + HTTPS.length + offset),
				})
				index += HTTPS.length + offset - 1
				continue
			// http://
			} else if (nchars >= HTTP.length && text.slice(index, index + HTTP.length) === HTTP) {
				// TODO: Check other whitespace characters? E.g. \s
				let offset = text.slice(index + HTTP.length).indexOf(" ")
				if (offset === -1) {
					// Set offset to EOL:
					offset = nchars - HTTP.length
				}
				data.push({
					type: A,
					syntax: [HTTP],
					children: text.slice(index + HTTP.length, index + HTTP.length + offset),
				})
				index += HTTP.length + offset - 1
				continue
			}
			break
		default:
			// No-op
			break
		}
		if (!data.length || typeof data[data.length - 1] !== "string") {
			data.push(char)
			continue
		}
		data[data.length - 1] += char
	}
	// Return a string (one-off):
	if (data.length === 1 && typeof data[0] === "string") {
		return data[0]
	}
	// Return an array:
	return data
}

// Creates a new hash epoch for URL hashes.
function newHashEpoch() {
	const hashes = {}
	const newHash = str => {
		// ALPHA / DIGIT / "-" / "." / "_" / "~"
		//
		// https://tools.ietf.org/html/rfc3986
		const hash = str
			.toLowerCase()
			.trim() // Remove extraneous whitespace
			.replace(/\s+/g, "-")
			.replace(/[^\w\-\.\~]/g, "") // eslint-disable-line no-useless-escape
		const seen = hashes[hash]
		if (!seen) {
			hashes[hash] = 0
		}
		hashes[hash]++
		return hash + (!seen ? "" : `-${hashes[hash]}`)
	}
	return newHash
}

// Parses GFM to a VDOM representation.
//
// TODO (1): To support Hemingway, preprocess text? E.g.
// parseTextHemingway (can support custom spellcheck, etc.)
// TODO (2): Memoize data (somehow)
function parseGFM(text) {
	const newHash = newHashEpoch()

	const data = []
	const paragraphs = text.split("\n")
	// NOTE: Use an index for multiline elements
	for (let index = 0; index < paragraphs.length; index++) {
		const each = paragraphs[index]
		const char = each.charAt(0)
		switch (true) {
		// <H1>
		case char === "#":
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
					type: [H1, H2, H3, H4, H5, H6][syntax[0].length - 2],
					syntax,
					// TODO: Upgrade to toText to create a hash based
					// off of text, not markdown
					hash: newHash(each.slice(syntax[0].length)),
					children: parseTextGFM(each.slice(syntax[0].length)),
				})
				continue
			}
			break
		// <Break>
		case char === "-" || char === "*":
			if (each.length === 3 && each === char.repeat(3)) {
				data.push({
					id: uuidv4(),
					type: Break,
					syntax: [each],
					children: null,
				})
				continue
			}
			break
		default:
			// No-op
			break
		}
		// <Paragraph>
		data.push({
			id: uuidv4(),
			type: Paragraph,
			syntax: null,
			children: parseTextGFM(each),
		})
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
		const { type: Type } = each
		components.push((
			<Type key={components.length} syntax={each.syntax}>
				{toReact(each.children)}
			</Type>
		))
	}
	return components
}

// function toInnerText(data, { markdown } = { markdown: false }) {
// 	if (children === null || typeof children === "string") {
// 		str += children || ""
// 		return
// 	}
// 	for (const each of children) {
// 		if (each === null || typeof each === "string") {
// 			str += each || ""
// 			continue
// 		}
// 		const [s1, s2] = parseSyntax(each.syntax)
// 		str += (markdown && s1) || ""
// 		recurse(each.children)
// 		str += (markdown && s2) || ""
// 	}
// }

// Converts a VDOM representation to text.
function toText(data, { markdown } = { markdown: false }) {
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
			const [s1, s2] = parseSyntax(each.syntax)
			str += (markdown && s1) || ""
			recurse(each.children)
			str += (markdown && s2) || ""
		}
	}
	// Iterate top-level children:
	for (const each of data) {
		const [s1, s2] = parseSyntax(each.syntax)
		str += (markdown && s1) || ""
		recurse(each.children)
		str += (markdown && s2) || ""
		if (each !== data[data.length - 1]) {
			// TODO: Can add dynamic support for \r\n here
			str += "\n" // EOL
		}
	}
	return str
}

// Converts a VDOM representation to an HTML string.
function toHTML(data, { indent } = { indent: false }) {
	let str = ""
	// Recurse children:
	const recurse = children => {
		if (children === null || typeof children === "string") {
			str += escape(children) || "<br>"
			return
		}
		for (const each of children) {
			if (each === null || typeof each === "string") {
				str += escape(each) || "<br>"
				continue
			}
			const [startTag, endTag] = cmapHTML[each.type]
			str += startTag
			recurse(each.children)
			str += endTag
		}
	}
	// Iterate top-level children:
	for (const each of data) {
		// NOTE: Use x.type because of React.memo or use
		// each.type.type || each.type
		const [startTag, endTag] = cmapHTML[each.type.type || each.type]
		str += `${startTag}${!indent ? "" : "\n\t"}`
		if (each.type !== Break) {
			recurse(each.children)
		}
		str += `${!indent ? "" : "\n"}${endTag}`
		if (each !== data[data.length - 1]) {
			// TODO: Can add dynamic support for \r\n here
			str += "\n" // EOL
		}
	}
	return str
}

// Renders editor blocks.
const EditorBlocks = ({ data, ...props }) => (
	data.map(({ type: Type, ...each }) => (
		<Type key={each.id} {...{ ...each, children: undefined }} data={each.children} />
	))
)

const EditorContext = React.createContext()

// Maps type references to names or HTML.
const cmap = new Map()
const cmapHTML = new Map()

;(() => {
	// React:
	cmap[Escape] = "Escape"
	cmap[Em] = "Em"
	cmap[Strong] = "Strong"
	cmap[StrongAndEm] = "StrongAndEm"
	cmap[Code] = "Code"
	cmap[Strike] = "Strike"
	cmap[A] = "A"

	cmap[H1.type] = "H1"
	cmap[H2.type] = "H2"
	cmap[H3.type] = "H3"
	cmap[H4.type] = "H4"
	cmap[H5.type] = "H5"
	cmap[H6.type] = "H6"
	cmap[Paragraph.type] = "Paragraph"
	cmap[Break.type] = "Break"

	// HTML:
	cmapHTML[Escape] = ["", ""] // No-op OR <span class="escape">
	cmapHTML[Em] = ["<em>", "</em>"]
	cmapHTML[Strong] = ["<strong>", "</strong>"]
	cmapHTML[StrongAndEm] = ["<strong><em>", "</em></strong>"]
	cmapHTML[Code] = ["<code>", "</code>"]
	cmapHTML[Strike] = ["<strike>", "</strike>"]
	cmapHTML[A] = ["<a href=\"TODO\">", "</a>"] // TODO: href

	cmapHTML[H1.type] = ["<h1>", "</h1>"]
	cmapHTML[H2.type] = ["<h2>", "</h2>"]
	cmapHTML[H3.type] = ["<h3>", "</h3>"]
	cmapHTML[H4.type] = ["<h4>", "</h4>"]
	cmapHTML[H5.type] = ["<h5>", "</h5>"]
	cmapHTML[H6.type] = ["<h6>", "</h6>"]
	cmapHTML[Paragraph.type] = ["<p>", "</p>"]
	cmapHTML[Break.type] = ["<hr>", ""] // Leaf node
})()

function stringify(obj) {
	const data = JSON.stringify(
		obj,
		(key, value) => {
			// Non-component:
			if (key !== "type") {
				return value
			}
			// Component (guard React.memo):
			if (value.type) {
				value = value.type
			}
			return `<${cmap[value]}>`
		},
		"\t",
	)
	return data
}

const DocumentTitle = props => {
	React.useEffect(() => {
		document.title = props.title
	}, [props.title])
	return props.children
}

// Renders an editor.
const Editor = ({ state, setState, ...props }) => {
	const ref = React.useRef()

	// Rerender the DOM when data changes (use useLayoutEffect
	// because of contenteditable):
	//
	// TODO: Use useMemo?
	React.useLayoutEffect(() => {
		// React.useCallback(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			// FIXME: Prevent useless rerenders to <Provider>?
			<Provider value={state}>
				<EditorBlocks data={state.data} />
			</Provider>,
			ref.current,
		)
		// }, [state.data]),
	}, [state])

	// TODO: How does copy and paste work?
	React.useEffect(() => {
		// const AVG_RUNES_PER_WORD = 6
		// const AVG_WORDS_PER_MINUTE = 250
		const text = toText(state.data)
		const markdown = toText(state.data, { markdown: true })
		const html = toHTML(state.data)
		setState(current => ({
			...current,
			// // TODO: Convert to a rich data structure with nesting
			// tableOfContents: state.data.filter(each => (
			// 	each.type === H1 ||
			// 	each.type === H2 ||
			// 	each.type === H3 ||
			// 	each.type === H4 ||
			// 	each.type === H5 ||
			// 	each.type === H6
			// )),
			meta: {
				title: [...text.split("\n", 1)[0]].slice(0, 100).join("") || "Untitled",
				runes: [...text].length,
				words: text.split(/\s+/).filter(Boolean).length,
				// clock: Math.ceil(runes / AVG_RUNES_PER_WORD / AVG_WORDS_PER_MINUTE * 60),
			},
			text,
			markdown,
			html,
		}))
	}, [
		state.data,
		setState,
	])

	return (
		// <React.Fragment>
		<DocumentTitle title={!state.meta ? "Loading…" : state.meta.title}>

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

					contentEditable: !state.readOnly,
					suppressContentEditableWarning: !state.readOnly,
				},
			)}

			{/* Debugger */}
			{true && (
				<div className="my-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
					{stringify(state)}
				</div>
			)}

		</DocumentTitle>
		// </React.Fragment>
	)
}

const App = props => {
	// <textarea> (1 of 2):
	const [value, setValue] = React.useState(() => {
		const cache = localStorage.getItem("codex-app-v2")
		if (cache) {
			const json = JSON.parse(cache)
			return json.data
		}
		return `
# This is a header
## This is a subheader
### H3
#### H4
##### H5
###### H6

---
***

*oh*man*is*it*
_oh_man_is_it_

*oh*shit* -- OK
**oh**shit** -- OK
***oh***shit*** -- OK
_oh_shit_ -- OK
__oh__shit__ -- OK
___oh___shit___ -- OK
\`oh\`shit\` -- OK
~oh~shit~ -- OK
~~oh~~shit~~ -- OK

* oh *
** oh **
*** oh *** -- Not sure
_ oh _
__ oh __
___ oh ___ -- Not sure
\` oh \`
~ oh ~
~~ oh ~~

_em **and**_ **strong** or ~strike~ or ~~strike~~

_em_ **_and_ strong**
`.trim()
	})

	// <textarea> (2 of 2):
	React.useEffect(() => {
		localStorage.setItem("codex-app-v2", JSON.stringify({ data: value }))
	}, [value])

	// State (once):
	const [state, setState] = React.useState(() => ({
		readOnly: false,
		data: parseGFM(value),
	}))

	// State (per update):
	React.useLayoutEffect(() => {
		setState(current => ({
			...current,
			data: parseGFM(value),
		}))
	}, [value])

	// // DEBUG
	// React.useEffect(() => {
	// 	const id = setTimeout(() => {
	// 		console.log({ state })
	// 	}, 100)
	// 	return () => {
	// 		clearTimeout(id)
	// 	}
	// }, [state])

	// Shortcuts:
	React.useEffect(() => {
		const handler = e => {
			if (!e.metaKey || e.keyCode !== 80) {
				// No-op
				return
			}
			e.preventDefault()
			setState(current => ({
				...current,
				readOnly: !state.readOnly,
			}))
		}
		window.addEventListener("keydown", handler)
		return () => {
			window.removeEventListener("keydown", handler)
		}
	}, [state.readOnly])

	return (
		<div className="flex flex-row justify-center">
			<div className="px-6 py-32 flex flex-row w-full max-w-6xl">

				<div className="p-3 fixed right-0 top-0">
					<button
						className="px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
						onPointerDown={e => e.preventDefault()}
						onClick={e => setState({ ...state, readOnly: !state.readOnly })}
					>
						Toggle read-only: {!state.readOnly ? "OFF" : "ON"}
					</button>
				</div>

				{/* LHS */}
				<div className="flex-shrink-0 w-1/2">
					<textarea
						className="w-full h-full resize-none outline-none"
						value={value}
						onChange={e => setValue(e.target.value)}
					/>
				</div>

				{/* RHS */}
				<div className="flex-shrink-0 w-6" />
				<div className="flex-shrink-0 w-1/2">
					<Editor
						// className="text-lg"
						state={state}
						setState={setState}
					/>
				</div>

			</div>
		</div>
	)
}

export default App
