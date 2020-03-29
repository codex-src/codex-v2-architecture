import escape from "lodash/escape"
import React from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

import "./AppRichText.css"

// Maps user-perceived language extensions to PrismJS
// languages.
const languages = {}

// Extracts a language extension from a metadata string.
function getLanguage(metadata) {
	const index = metadata.lastIndexOf(".")
	if (index === -1 || index + 1 === metadata.length) {
		return metadata
	}
	return metadata.slice(index + 1)
}

document.addEventListener("DOMContentLoaded", e => {
	if (!window.Prism || !window.Prism.languages) {
		// No-op
		return
	}
	/* eslint-disable no-multi-spaces */
	languages.bash       = ["bash", window.Prism.languages.bash]
	languages.c          = ["c", window.Prism.languages.c]
	languages.cpp        = ["cpp", window.Prism.languages.cpp]
	languages.css        = ["css", window.Prism.languages.css]
	languages.d          = ["d", window.Prism.languages.d]
	languages.diff       = ["diff", window.Prism.languages.diff]
	languages.docker     = ["docker", window.Prism.languages.docker]
	languages.dockerfile = ["dockerfile", window.Prism.languages.dockerfile]
	languages.git        = ["git", window.Prism.languages.git]
	languages.go         = ["go", window.Prism.languages.go]
	// languages.gql     = ["graphql", window.Prism.languages.graphql]
	languages.graphql    = ["graphql", window.Prism.languages.graphql]
	// languages.htm     = ["html", window.Prism.languages.html]
	languages.html       = ["html", window.Prism.languages.html]
	languages.http       = ["http", window.Prism.languages.http]
	languages.js         = ["jsx", window.Prism.languages.jsx]
	languages.json       = ["json", window.Prism.languages.json]
	languages.jsx        = ["jsx", window.Prism.languages.jsx] // Uses jsx
	languages.kotlin     = ["kotlin", window.Prism.languages.kotlin]
	languages.php        = ["php", window.Prism.languages.php]
	languages.py         = ["py", window.Prism.languages.py]
	languages.rb         = ["rb", window.Prism.languages.rb]
	languages.ruby       = ["ruby", window.Prism.languages.ruby]
	languages.rust       = ["rust", window.Prism.languages.rust]
	languages.sass       = ["sass", window.Prism.languages.sass]
	languages.sh         = ["shell-session", window.Prism.languages["shell-session"]]
	// languages.shell   = ["shell-session", window.Prism.languages["shell-session"]]
	languages.sql        = ["sql", window.Prism.languages.sql]
	languages.svg        = ["svg", window.Prism.languages.svg]
	languages.swift      = ["swift", window.Prism.languages.swift]
	languages.ts         = ["tsx", window.Prism.languages.tsx] // Uses tsx
	languages.tsx        = ["tsx", window.Prism.languages.tsx]
	languages.wasm       = ["wasm", window.Prism.languages.wasm]
	languages.xml        = ["xml", window.Prism.languages.xml]
	languages.yaml       = ["yaml", window.Prism.languages.yaml]
	languages.yml        = ["yml", window.Prism.languages.yml]
	/* eslint-enable no-multi-spaces */
})

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

	const [startSyntax, endSyntax] = parseSyntax(syntax)
	return (
		<React.Fragment>
			{startSyntax && (
				<Syntax className={className} readOnly={readOnly}>
					{startSyntax}
				</Syntax>
			)}
			{props.children}
			{endSyntax && (
				<Syntax className={className} readOnly={readOnly}>
					{endSyntax}
				</Syntax>
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
		// NOTE (1): Don’t use text-sm; uses rem instead of em
		// NOTE (2): Use verticalAlign: 1 because of <Strike>
		<span className="p-px font-mono text-red-600 bg-red-100 rounded" style={{ verticalAlign: 1, fontSize: "0.875em" }}>
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
	<span className="line-through text-gray-500" style={{ "--md-blue-a400": "currentColor" }}>
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

// Higher-order component for block elements.
const $Node = ({ id, style, ...props }) => (
	<div id={id} style={{ whiteSpace: "pre-wrap", ...style }} data-node {...props}>
		{props.children}
	</div>
)

// Higher-order component for multiline block elements.
const CompoundNode = ({ id, style, ...props }) => (
	<div id={id} style={{ whiteSpace: "pre-wrap", ...style }} data-compound-node {...props}>
		{props.children}
	</div>
)

const H1 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-medium text-3xl leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</$Node>
))

const H2 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-medium text-2xl leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</$Node>
))

const H3 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold text-xl leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</$Node>
))

const H4 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold text-lg leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</$Node>
))

const H5 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</$Node>
))

const H6 = React.memo(({ id, syntax, hash, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id} className="font-semibold leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</$Node>
))

const Paragraph = React.memo(({ id, syntax, data, ...props }) => (
	// eslint-disable-next-line react/jsx-pascal-case
	<$Node id={id}>
		{toInnerReact(data) || (
			<br />
		)}
	</$Node>
))

// NOTE: Compound component
const Blockquote = React.memo(({ id, syntax, data, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	// TODO: Dynamically compute syntax width for padding-left
	const readOnlyStyle = { paddingLeft: "calc(14.27 / 16 * 1em)", boxShadow: "-2px 0 var(--gray-600)" }
	return (
		<CompoundNode id={id}>
			{data.map((each, index) => (
				// eslint-disable-next-line react/jsx-pascal-case
				<$Node key={each.id} id={each.id} className="text-gray-600" style={!readOnly ? null : readOnlyStyle}>
					<Markdown syntax={each.syntax}>
						{toInnerReact(each.children) || (
							<br />
						)}
					</Markdown>
				</$Node>
			))}
		</CompoundNode>
	)
})

// Near-copy of <CodeBlock> used for rendering as a
// standalone component. Doesn’t use React.memo.
const CodeBlockStandalone = ({ metadata, data, ...props }) => {
	const [lang, setLang] = React.useState("")
	const [html, setHTML] = React.useState("")

	React.useEffect(() => {
		const match = languages[getLanguage(metadata)]
		if (!match) {
			// No-op
			return
		}
		const [lang, parse] = match
		try {
			setLang(lang)
			setHTML(window.Prism.highlight(data, parse, lang))
		} catch (error) {
			console.error(error)
		}
	}, [metadata, data])

	return (
		<div className="-mx-4 my-2 px-6 py-4 whitespace-pre-wrap font-mono text-sm leading-snug bg-white rounded-lg-xl shadow-hero-lg" {...props}>
			{!html ? (
				data
			) : (
				<span
					className={!lang ? null : `language-${lang}`}
					dangerouslySetInnerHTML={{
						__html: html,
					}}
				/>
			)}
			{data && (
				<br />
			)}
		</div>
	)
}

// NOTE: Compound component
// TODO: Add a transition delay to colors?
const CodeBlock = React.memo(({ id, syntax, metadata, data, ...props }) => {
	const { stylesheet } = React.useContext(EditorContext)

	const [lang, setLang] = React.useState("")
	const [html, setHTML] = React.useState("")

	React.useEffect(() => {
		const match = languages[getLanguage(metadata)]
		if (!match) {
			// No-op
			return
		}
		const [lang, parse] = match
		try {
			setLang(lang)
			setHTML(window.Prism.highlight(data, parse, lang))
		} catch (error) {
			console.error(error)
		}
	}, [metadata, data])

	return (
		<CompoundNode className="-mx-4 my-2 px-6 py-4 font-mono leading-snug bg-white rounded-lg-xl shadow-hero-lg" style={{ fontSize: stylesheet !== "type" ? null : "0.875em" }} spellCheck={false}>
			{/* eslint-disable-next-line react/jsx-pascal-case */}
			<$Node className="text-md-blue-a400">
				<Markdown syntax={[syntax + metadata]} />
			</$Node>
			{/* eslint-disable-next-line react/jsx-pascal-case */}
			<$Node>
				{!html ? (
					data
				) : (
					<span
						className={!lang ? null : `language-${lang}`}
						dangerouslySetInnerHTML={{
							__html: html,
						}}
					/>
				)}
				{data && (
					<br />
				)}
			</$Node>
			{/* eslint-disable-next-line react/jsx-pascal-case */}
			<$Node className="text-md-blue-a400">
				<Markdown syntax={[syntax]} />
			</$Node>
		</CompoundNode>
	)
})

const Break = React.memo(({ id, syntax, data, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	return (
		// eslint-disable-next-line react/jsx-pascal-case
		<$Node id={id}>
			{!readOnly ? (
				<Markdown syntax={syntax} />
			) : (
				<hr className="inline-block w-full" style={{ verticalAlign: "15%" }} />
			)}
		</$Node>
	)
})

// Returns whether a character is an ASCII whitespace
// character as defined by the GFM spec.
//
// https://github.github.com/gfm/#whitespace-character
function isASCIIWhitespace(char) {
	const ok = (
		char === "\u0020" ||
		char === "\u0009" ||
		char === "\u000a" ||
		char === "\u000b" ||
		char === "\u000c" ||
		char === "\u000d"
	)
	return ok
}

// Returns whether a character is an ASCII punctuation
// character as defined by the GFM spec.
//
// Covers: <start> !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ <end>
//
// https://github.github.com/gfm/#ascii-punctuation-character
function isASCIIPunctuation(char) {
	const ok = (
		(char >= "\u0021" && char <= "\u002f") ||
		(char >= "\u003a" && char <= "\u0040") ||
		(char >= "\u005b" && char <= "\u0060") ||
		(char >= "\u007b" && char <= "\u007e")
	)
	return ok
}

// Registers a type for parseInnerGFM.
//
// TODO: Update [^a-zA-Z0-9] to ‘ASCII punctuation
// character’ -- https://github.github.com/gfm/#ascii-punctuation-character
function registerType(type, syntax, { recurse } = { recurse: true }) {
	// Escape syntax for regex:
	let pattern = syntax.split("").map(each => `\\${each}`).join("")
	let patternOffset = 0
	if (syntax[0] === "_") {
		// https://github.github.com/gfm/#example-369
		pattern = `[^\\\\]${pattern}(\\s|[\\u0021-\\u002f\\u003a-\\u0040\\u005b-\\u0060\\u007b-\\u007e]|$)`
		patternOffset++
	} else if (syntax[0] === "`") {
		// No-op
		//
		// https://github.github.com/gfm/#example-348
	} else {
		pattern = `[^\\\\]${pattern}`
		patternOffset++
	}
	const parse = (text, index) => {
		// Guard: _Em_ and __strong and em__ cannot be nested:
		//
		// https://github.github.com/gfm/#example-369
		if (syntax[0] === "_" && index - 1 >= 0 && (!isASCIIWhitespace(text[index - 1]) && !isASCIIPunctuation(text[index - 1]))) {
			return null
		}
		// Guard: Syntax (not `code`) cannot surround spaces:
		const offset = text.slice(index + syntax.length).search(pattern) + patternOffset
		if (
			offset <= 0 ||
			(syntax !== "`" && text[index + syntax.length] === " ") ||           // Exempt code
			(syntax !== "`" && text[index + syntax.length + offset - 1] === " ") // Exempt code
		) {
			return null
		}
		index += syntax.length
		const object = {
			type,
			syntax,
			children: !recurse
				? text.slice(index, index + offset)
				: parseInnerGFM(text.slice(index, index + offset)),
		}
		index += syntax.length + offset - 1
		return { object, x2: index }
	}
	return parse
}

const HTTPS = "https://"
const HTTP = "http://"

// Parses a nested VDOM representation to GFM text.
//
// TODO (1): Can extract registerType(...)(...) to
// parseStrongAndEm(...)
// TODO (2): Parse 😀 here -- not GFM (e.g. !index)
function parseInnerGFM(text) {
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
		case char === "h":
			// https://
			if (nchars >= HTTPS.length && text.slice(index, index + HTTPS.length) === HTTPS) {
				// TODO: Check other whitespace characters? E.g. \s
				let offset = text.slice(index + HTTPS.length).indexOf(" ")
				if (offset === -1) {
					offset = nchars - HTTPS.length // EOL
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
					offset = nchars - HTTP.length // EOL
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
			// Convert spaces and dashes to one dash
			.replace(/(\s+|-+)/g, "-")
			// Drop URL unsafe characters
			.replace(/[^\w\-\.\~]/g, "") // eslint-disable-line no-useless-escape
			// Trim dashes
			.replace(/(^-+|-+$)/g, "")
		const seen = hashes[hash]
		if (!seen) {
			hashes[hash] = 0
		}
		hashes[hash]++
		return hash + (!seen ? "" : `-${hashes[hash]}`)
	}
	return newHash
}

// // List
// // { regex: /^((?:\t*[*+\-•] .*\n?)*\t*[*+\-•] .*)/,
// { regex: /^((?:\t*[*•] .*\n?)*\t*[*•] .*)/,
// parse: (offset, key, matches) =>
// 	<List key={key} children={parseList(offset, matches[1])} /> },
//
// // List isNumbered
// { regex: /^((?:\t*\d+[.)] .*\n?)*\t*\d+[.)] .*)/,
// parse: (offset, key, matches) =>
// 	<List key={key} isNumbered children={parseList(offset, matches[1], true)} /> },
//
// // Checklist
// { regex: /^((?:\t*[+-] .*\n?)*\t*[+-] .*)/,
// parse: (offset, key, matches) =>
// 	<Checklist key={key} children={parseList(offset, matches[1])} /> },

// Parses a VDOM representation to GFM text.
//
// TODO (1): To support Hemingway, preprocess text? E.g.
// parseTextHemingway (can support custom spellcheck, etc.)
// TODO (2): Cache data or body?
// TODO (3): Change API to be ID-aware
function parseGFM(text) {
	const newHash = newHashEpoch()

	const data = []
	const body = text.split("\n")
	// NOTE: Use an index for multiline elements
	for (let index = 0; index < body.length; index++) {
		const each = body[index]
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
				const syntax = each.slice(0, each.indexOf(" ") + 1)
				data.push({
					id: uuidv4(),
					type: [H1, H2, H3, H4, H5, H6][syntax.length - 2],
					syntax: [syntax],
					hash: newHash(toInnerText(parseInnerGFM(each.slice(syntax.length)))),
					children: parseInnerGFM(each.slice(syntax.length)),
				})
				continue
			}
			break
		// <Blockquote>
		case char === ">":
			if (
				(each.length >= 2 && each.slice(0, 2) === "> ") ||
				(each.length === 1 && each === ">")
			) {
				const x1 = index
				let x2 = x1
				x2++
				// Iterate to end syntax:
				while (x2 < body.length) {
					if (
						(body[x2].length < 2 || body[x2].slice(0, 2) !== "> ") &&
						(body[x2].length !== 1 || body[x2] !== ">")
					) {
						// No-op
						break
					}
					x2++
				}
				data.push({
					id: uuidv4(),
					type: Blockquote,
					syntax: null,
					children: body.slice(x1, x2).map(each => ({
						id: uuidv4(),
						type: Paragraph,
						syntax: [each.slice(0, 2)],
						children: parseInnerGFM(each.slice(2)),
					})),
				})
				index = x2 - 1
				continue
			}
			break
		// <CodeBlock>
		case char === "`":
			// TODO: Check GFM spec for backticks, etc.
			if (
				each.length >= 3 &&
				each.slice(0, 3) === "```" &&
				index + 1 < body.length
			) {
				const x1 = index
				let x2 = x1
				x2++
				// Iterate to end syntax:
				while (x2 < body.length) {
					if (body[x2].length === 3 && body[x2] === "```") {
						// No-op
						break
					}
					x2++
				}
				if (x2 === body.length) { // Unterminated
					index = x1
					break
				}
				x2++ // Iterate once past end
				data.push({
					id: uuidv4(),
					type: CodeBlock,
					syntax: "```",
					metadata: each.slice(3),
					children: body.slice(x1 + 1, x2 - 1).join("\n"),
				})
				index = x2 - 1
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
			children: parseInnerGFM(each),
		})
	}
	return data
}

// Converts a nested VDOM representation to renderable React
// components.
function toInnerReact(children) {
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
				{toInnerReact(each.children)}
			</Type>
		))
	}
	return components
}

// Converts a nested VDOM representation to text.
function toInnerText(children, options = { markdown: false }) {
	let text = ""
	if (children === null || typeof children === "string") {
		return children || ""
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			text += each || ""
			continue
		}
		const [s1, s2] = parseSyntax(each.syntax)
		text += (options.markdown && s1) || ""
		text += toInnerText(each.children, options)
		text += (options.markdown && s2) || ""
	}
	return text
}

// Converts a VDOM representation to text.
function toText(data, options = { markdown: false }) {
	let text = ""
	// Iterate elements:
	for (const each of data) {
		const [s1, s2] = parseSyntax(each.syntax)
		text += (options.markdown && s1) || ""
		if (each.type === Break) {
			// No-op
		} else if (each.type === Blockquote) {
			text += toText(each.children, options)
		} else {
			text += toInnerText(each.children, options)
		}
		text += (options.markdown && s2) || ""
		if (each !== data[data.length - 1]) {
			text += "\n"
		}
	}
	return text
}

// Converts a nested VDOM representation to HTML.
function toInnerHTML(children) {
	let html = ""
	if (children === null || typeof children === "string") {
		return escape(children) || "<br>"
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			html += escape(each) || "<br>"
			continue
		}
		const [s1, s2] = cmapHTML[each.type.type || each.type]
		html += typeof s1 !== "function" ? s1 : s1(each)
		html += toInnerHTML(each.children)
		html += s2
	}
	return html
}

// // Converts a VDOM representation to an HTML string.
// function toHTML(data, __depth = 0) {
// 	let html = ""
// 	// Iterate elements:
// 	for (const each of data) {
// 		const [s1, s2] = cmapHTML[each.type.type || each.type]
// 		html += `${typeof s1 !== "function" ? s1 : s1(each)}\n${"\t".repeat(__depth + 1)}`
// 		if (each.type === Break) {
// 			// No-op
// 		} else if (each.type === Blockquote) { // TODO: Add CodeBlock?
// 			html += toHTML(each.children, __depth + 1)
// 		} else {
// 			html += toInnerHTML(each.children)
// 		}
// 		html += `\n${"\t".repeat(__depth)}${s2}`
// 		if (each !== data[data.length - 1]) {
// 			html += `\n${"\t".repeat(__depth)}`
// 		}
// 	}
// 	return html
// }

// Converts a VDOM representation to an HTML string.
function toHTML(data, __depth = 0) {
	let html = ""
	// Iterate elements:
	for (const each of data) {
		const [s1, s2] = cmapHTML[each.type.type || each.type]
		html += /* "\t".repeat(__depth) + */ (typeof s1 !== "function" ? s1 : s1(each))
		if (each.type === Break) {
			// No-op
		} else if (each.type === Blockquote) {
			html += (
				// eslint-disable-next-line prefer-template
				"\n" +
				toHTML(each.children)
					.split("\n")
					.map(each => `\t${each}`)
					.join("\n") +
				"\n"
			)
		} else {
			html += toInnerHTML(each.children)
		}
		html += s2
		if (each !== data[data.length - 1]) {
			html += "\n"
		}
	}
	return html
}

// Converts a VDOM representation to a JSON string.
//
// FIXME: Don’t store React types in VDOM -- then toJSON can
// be deleted
function toJSON(data) {
	const json = JSON.stringify(
		data,
		(key, value) => {
			// Non-React component:
			if (key !== "type") {
				return value
			}
			// React component (guard React.memo):
			return `<${cmap[value.type || value]}>`
		},
		"\t",
	)
	return json
}

// const EditorBlocks = ({ data, ...props }) => (
// 	data.map(({ type: Type, ...each }) => (
// 		// NOTE: props.children (on any component) cannot be an
// 		// object; rename to data
// 		<Type key={each.id} {...{ ...each, children: undefined }} data={each.children} />
// 	))
// )

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
	cmap[Blockquote.type] = "Blockquote"
	cmap[CodeBlock.type] = "CodeBlock"
	cmap[Break.type] = "Break"

	// HTML:
	cmapHTML[Escape] = ["", ""] // No-op
	cmapHTML[Em] = ["<em>", "</em>"]
	cmapHTML[Strong] = ["<strong>", "</strong>"]
	cmapHTML[StrongAndEm] = ["<strong><em>", "</em></strong>"]
	cmapHTML[Code] = ["<code>", "</code>"]
	cmapHTML[Strike] = ["<strike>", "</strike>"]

	// NOTE: Use href="..." not href='...' because " URLs
	// expect " to be percent-encoded (e.g. %22)
	cmapHTML[A] = [data => `<a href="${data.syntax + data.children}">`, "</a>"]

	// cmapHTML[H1.type] = [data => `<a href="#${data.hash}"><h1 id="${data.hash}">`, "</h1></a>"]
	// cmapHTML[H2.type] = [data => `<a href="#${data.hash}"><h2 id="${data.hash}">`, "</h2></a>"]
	// cmapHTML[H3.type] = [data => `<a href="#${data.hash}"><h3 id="${data.hash}">`, "</h3></a>"]
	// cmapHTML[H4.type] = [data => `<a href="#${data.hash}"><h4 id="${data.hash}">`, "</h4></a>"]
	// cmapHTML[H5.type] = [data => `<a href="#${data.hash}"><h5 id="${data.hash}">`, "</h5></a>"]
	// cmapHTML[H6.type] = [data => `<a href="#${data.hash}"><h6 id="${data.hash}">`, "</h6></a>"]
	// cmapHTML[Paragraph.type] = ["<p>", "</p>"]
	// cmapHTML[Blockquote.type] = ["<blockquote>", "</blockquote>"]
	// cmapHTML[CodeBlock.type] = [data => `<pre${!getLanguage(data.metadata) ? "" : ` class="language-${getLanguage(data.metadata)}"`}><code>`, "</code></pre>"]
	// cmapHTML[Break.type] = ["<hr>", ""] // Leaf node

	cmapHTML[H1.type] = [data => `<a href="#${data.hash}">\n\t<h1 id="${data.hash}">\n\t\t`, "\n\t</h1>\n</a>"]
	cmapHTML[H2.type] = [data => `<a href="#${data.hash}">\n\t<h2 id="${data.hash}">\n\t\t`, "\n\t</h2>\n</a>"]
	cmapHTML[H3.type] = [data => `<a href="#${data.hash}">\n\t<h3 id="${data.hash}">\n\t\t`, "\n\t</h3>\n</a>"]
	cmapHTML[H4.type] = [data => `<a href="#${data.hash}">\n\t<h4 id="${data.hash}">\n\t\t`, "\n\t</h4>\n</a>"]
	cmapHTML[H5.type] = [data => `<a href="#${data.hash}">\n\t<h5 id="${data.hash}">\n\t\t`, "\n\t</h5>\n</a>"]
	cmapHTML[H6.type] = [data => `<a href="#${data.hash}">\n\t<h6 id="${data.hash}">\n\t\t`, "\n\t</h6>\n</a>"]
	cmapHTML[Paragraph.type] = ["<p>\n\t", "\n</p>"]
	cmapHTML[Blockquote.type] = ["<blockquote>", "</blockquote>"]
	cmapHTML[CodeBlock.type] = [data => `<pre${!getLanguage(data.metadata) ? "" : ` class="language-${getLanguage(data.metadata)}"`}><code>`, "</code></pre>"]
	cmapHTML[Break.type] = ["<hr>", ""] // Leaf node
})()

// Sets the document title (uses useEffect).
const DocumentTitle = ({ title, ...props }) => {
	React.useEffect(() => {
		if (!title) {
			// No-op
			return
		}
		document.title = title
	}, [title])
	return props.children || null
}

const AVG_RUNES_PER_WORD = 6
const AVG_WORDS_PER_MINUTE = 250

// TODO: Add value to state (needed for backspace)
const Editor = ({ className, style, state, setState, ...props }) => {
	const ref = React.useRef()

	// Rerender the DOM when state.data changes:
	React.useLayoutEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			// TODO: Prevent useless rerenders to <Provider>?
			<Provider value={state}>
				{state.data.map(({ type: Type, ...each }) => (
					// NOTE: props.children (on any component) cannot
					// be an object; rename to data
					<Type key={each.id} {...{ ...each, children: undefined }} data={each.children} />
				))}
			</Provider>,
			ref.current,
		)
	}, [state])

	React.useEffect(() => {
		const text = toText(state.data)
		const runes = [...text].length // Precompute for seconds
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
				seconds: Math.ceil(runes / AVG_RUNES_PER_WORD / AVG_WORDS_PER_MINUTE * 60),
			},
		}))
	}, [
		state.data,
		setState,
	])

	return (
		React.createElement(
			"div",
			{
				ref,

				className: className,

				style: {
					outline: "none",
					caretColor: "black",
					...style,
				},

				// contentEditable: !state.readOnly,
				// suppressContentEditableWarning: !state.readOnly,
			},
		)
	)
}

const KEY_CODE_TAB = 9

const App = props => {
	const ref = React.useRef()

	// <textarea> (1 of 2):
	const [value, setValue] = React.useState(() => {
		const cache = localStorage.getItem("codex-app-v2")
		if (cache) {
			const json = JSON.parse(cache)
			if (json.data) {
				return json.data
			}
		}
		return `
# Hello, world!

_What in the hell am I looking at?_

This is a technical prototype for the new editor for https://opencodex.dev. **The left-hand side is a \`<textarea>\` you can type into and the right-hand side renders gorgeous React! 👀** This prototype specifically parses GitHub Flavored Markdown into _multiple_ data types, including \`text\`, \`html\`, and \`json\`.

Syntax highlighting is also supported using PrismJS. Simply open a code block and type!

\`\`\`go
package main

import "fmt"

func main() {
	fmt.Println("hello, world!")
}
\`\`\`

Crazy, huh?

**Try pressing the \`Text\`, \`Markdown\`, \`HTML\` and \`JSON\` buttons at the top; these convert the parsed markdown data structure to various formats.** This may help you better understand what’s going on behind the hood.
`.trim()
	})

	// <textarea> (2 of 2):
	React.useEffect(() => {
		localStorage.setItem("codex-app-v2", JSON.stringify({ data: value }))
	}, [value])

	// Create state:
	const [state, setState] = React.useState(() => ({
		// TODO: Use new Enum pattern
		renderMode: "markdown", // E.g. "text" || "markdown" || "html" || "json"
		stylesheet: "type",     // E.g. "type" || "mono"
		readOnly: false,
		data: parseGFM(value),
	}))

	// Update state (debounce 25ms):
	React.useEffect(() => {
		const id = setTimeout(() => {
			setState(current => ({
				...current,
				data: parseGFM(value),
			}))
		}, 25)
		return () => {
			clearTimeout(id)
		}
	}, [value])

	const [text, setText] = React.useState(() => toText(state.data))
	const [html, setHTML] = React.useState(() => toHTML(state.data))
	const [json, setJSON] = React.useState(() => toJSON(state.data))

	React.useEffect(() => {
		const id = setTimeout(() => {
			setText(toText(state.data))
			setHTML(toHTML(state.data))
			setJSON(toJSON(state.data))
		}, 25)
		return () => {
			clearTimeout(id)
		}
	}, [state.data])

	// Read-only shortcut:
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
			<div className="px-6 py-32 grid grid-cols-2 gap-6 w-full">

				{/* Read-only button: */}
				<div className="-my-1 p-3 fixed right-0 top-0">
					<div className="flex flex-col items-end">
						<div className="-mx-1 my-1 flex flex-row">
							<button
								className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
								onPointerDown={e => e.preventDefault()}
								onClick={e => setState({ ...state, renderMode: "text" })}
							>
								Text
							</button>
							<button
								className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
								onPointerDown={e => e.preventDefault()}
								onClick={e => setState({ ...state, renderMode: "markdown" })}
							>
								Markdown
							</button>
							<button
								className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
								onPointerDown={e => e.preventDefault()}
								onClick={e => setState({ ...state, renderMode: "html" })}
							>
								HTML
							</button>
							<button
								className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
								onPointerDown={e => e.preventDefault()}
								onClick={e => setState({ ...state, renderMode: "json" })}
							>
								JSON
							</button>
						</div>
						<div className="-mx-1 my-1 flex flex-row">
							{state.renderMode === "markdown" && (
								<React.Fragment>
									<button
										className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
										onPointerDown={e => e.preventDefault()}
										onClick={e => setState({ ...state, readOnly: !state.readOnly })}
									>
										{/* Coerce to a string: */}
										Toggle read-only: {(`${state.readOnly}`)}
									</button>
									<button
										className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
										onPointerDown={e => e.preventDefault()}
										onClick={e => setState({ ...state, stylesheet: state.stylesheet !== "type" ? "type" : "mono" })}
									>
										Toggle stylesheet: "{state.stylesheet}"
									</button>
								</React.Fragment>
							)}
						</div>
					</div>
				</div>

				{/* LHS */}
				<textarea
					ref={ref}
					// FIXME: Add min-height
					className="w-full h-full min-h-screen resize-none outline-none overflow-y-hidden"
					style={{ tabSize: 2 }}
					value={value}
					onKeyDown={e => {
						if (e.keyCode !== KEY_CODE_TAB) {
							// No-op
							return
						}
						e.preventDefault()
						const { value, selectionStart: pos1, selectionEnd: pos2 } = ref.current
						const newValue = `${value.slice(0, pos1)}\t${value.slice(pos2)}`
						ref.current.value = newValue
						ref.current.selectionStart = pos1 + 1
						ref.current.selectionEnd = pos1 + 1
						setValue(newValue)
					}}
					onChange={e => setValue(e.target.value)}
				/>

				{/* RHS */}
				<div>
					<DocumentTitle title={state.meta && state.meta.title}>
						{/* Text */}
						{state.renderMode === "text" && (
							<CodeBlockStandalone
								// Overwrite my-*:
								style={{ margin: "-0.5em 0", tabSize: 2 }}
								metadata="text"
								data={text}
							/>
						)}
						{/* Narkdown */}
						{state.renderMode === "markdown" && (
							<Editor
								className={state.stylesheet === "type" ? null : "font-mono"}
								style={{ tabSize: 2, fontSize: state.stylesheet === "type" ? null : "0.875em" }}
								state={state}
								setState={setState}
							/>
						)}
						{/* HTML */}
						{state.renderMode === "html" && (
							<CodeBlockStandalone
								// Overwrite my-*:
								style={{ margin: "-0.5em 0", tabSize: 2 }}
								metadata="html"
								data={html}
							/>
						)}
						{/* JSON */}
						{state.renderMode === "json" && (
							<CodeBlockStandalone
								// Overwrite my-*:
								style={{ margin: "-0.5em 0", tabSize: 2 }}
								metadata="json"
								data={json}
							/>
						)}
					</DocumentTitle>
				</div>

			</div>
		</div>
	)
}

export default App
