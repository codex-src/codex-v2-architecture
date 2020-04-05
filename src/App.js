// import * as Hero from "react-heroicons"
import * as emojiTrie from "emoji-trie"
import escape from "lodash/escape"
import Prism from "./Prism"
import React from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

import "./App.css"

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

const Syntax = ({ className, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	if (readOnly) {
		return null
	}
	return (
		<span className={className || "text-md-blue-a400"} {...props}>
			{props.children}
		</span>
	)
}

const Markdown = ({ syntax, ...props }) => {
	const [startSyntax, endSyntax] = parseSyntax(syntax)
	return (
		<React.Fragment>
			{startSyntax && (
				<Syntax {...props}>
					{startSyntax}
				</Syntax>
			)}
			{props.children}
			{endSyntax && (
				<Syntax {...props}>
					{endSyntax}
				</Syntax>
			)}
		</React.Fragment>
	)
}

const Emoji = ({ emoji, ...props }) => (
	<span className="emoji" aria-label={emoji.description} role="img">
		{props.children}
	</span>
)

const Escape = ({ syntax, ...props }) => (
	<Markdown syntax={syntax}>
		{props.children}
	</Markdown>
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
		<span className="p-px font-mono text-sm text-red-600 bg-red-100 rounded-sm" style={tabSize(2)} spellCheck={false}>
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

const strikeStyle = {
	"--red-100": "var(--gray-100)",
	"--red-600": "currentColor",
	"--md-blue-a400": "currentColor",

	textDecoration: "line-through",
	fontStyle: "italic",
	color: "var(--gray-500)",
}

const Strike = ({ syntax, ...props }) => (
	<span style={strikeStyle}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const A = ({ syntax, href, ...props }) => (
	<a className="underline text-md-blue-a400" href={href}>
		<Markdown syntax={!props.children || syntax}>
			{props.children || syntax}
		</Markdown>
	</a>
)

const NodeHOC = ({ id, tag, style, ...props }) => {
	const Tag = tag || "div"
	return (
		<Tag id={id} style={{ whiteSpace: "pre-wrap", ...style }} data-node {...props}>
			{props.children}
		</Tag>
	)
}

const CompoundNodeHOC = ({ id, tag, style, ...props }) => {
	const Tag = tag || "div"
	return (
		<Tag id={id} style={{ whiteSpace: "pre-wrap", ...style }} data-compound-node {...props}>
			{props.children}
		</Tag>
	)
}

const Header = React.memo(({ id, syntax, hash, data, ...props }) => (
	<NodeHOC id={id} className="font-medium text-3xl -tracking-px leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</NodeHOC>
))

const Subheader = React.memo(({ id, syntax, hash, data, ...props }) => (
	<NodeHOC id={id} className="font-medium text-2xl -tracking-px leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</NodeHOC>
))

const H3 = React.memo(({ id, syntax, hash, data, ...props }) => (
	<NodeHOC id={id} className="font-semibold text-xl -tracking-px leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</NodeHOC>
))

const H4 = React.memo(({ id, syntax, hash, data, ...props }) => (
	<NodeHOC id={id} className="font-semibold text-lg -tracking-px leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</NodeHOC>
))

const H5 = React.memo(({ id, syntax, hash, data, ...props }) => (
	<NodeHOC id={id} className="font-semibold -tracking-px leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</NodeHOC>
))

const H6 = React.memo(({ id, syntax, hash, data, ...props }) => (
	<NodeHOC id={id} className="font-semibold -tracking-px leading-tight">
		<a id={hash} className="block" href={`#${hash}`}>
			<Markdown syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</a>
	</NodeHOC>
))

const Paragraph = React.memo(({ id, syntax, data, ...props }) => {
	const emojis = (
		data &&
		Array.isArray(data) &&
		data.length <= 3 &&
		data.every(each => each.emoji)
	)
	return (
		<NodeHOC id={id} className={!emojis ? null : `emojis-${data.length}`}>
			{toInnerReact(data) || (
				<br />
			)}
		</NodeHOC>
	)
})

// NOTE: Compound component
const Blockquote = React.memo(({ id, syntax, data, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	// FIXME: Dynamically compute syntax size
	return (
		<CompoundNodeHOC id={id} className="my-2" style={{ boxShadow: !readOnly ? null : "inset 0.125em 0 var(--gray-600)" }}>
			{data.map((each, index) => (
				<NodeHOC key={each.id} id={each.id} className="text-gray-600" style={{ paddingLeft: !readOnly ? null : "calc(24.88/18 * 1em)" }}>
					<Markdown className="mr-2 text-md-blue-a400" syntax={each.syntax}>
						{toInnerReact(each.children) || (
							<br />
						)}
					</Markdown>
				</NodeHOC>
			))}
		</CompoundNodeHOC>
	)
})

// NOTE: Compound component
const CodeBlock = React.memo(({ id, syntax, metadata, data, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	const [lang, setLang] = React.useState("")
	const [html, setHTML] = React.useState("")

	React.useEffect(() => {
		const lang = (metadata.extension || metadata.raw).toLowerCase()
		const parser = Prism[lang]
		if (!parser) {
			// No-op
			return
		}
		setLang(lang)
		setHTML(window.Prism.highlight(data, parser, lang))
	}, [metadata, data])

	return (
		// NOTE: Doesn’t use py-* because of <Markdown>
		<CompoundNodeHOC className="-mx-6 my-2 px-6 break-words font-mono text-sm leading-snug border" style={tabSize(2)} spellCheck={false}>
			<NodeHOC className="py-px leading-none text-md-blue-a200">
				<Markdown syntax={[syntax + metadata.raw]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</NodeHOC>
			<NodeHOC>
				{html ? (
					<span
						className={!lang ? null : `language-${lang}`}
						dangerouslySetInnerHTML={{
							__html: html,
						}}
					/>
				) : (
					data
				)}
			</NodeHOC>
			<NodeHOC className="py-px leading-none text-md-blue-a200">
				<Markdown syntax={[syntax]}>
					{readOnly && (
						<br />
					)}
				</Markdown>
			</NodeHOC>
		</CompoundNodeHOC>
	)
})

const CodeBlockStandalone = ({ metadata, data, style, ...props }) => {
	const [lang, setLang] = React.useState("")
	const [html, setHTML] = React.useState("")

	React.useEffect(() => {
		const lang = (metadata.extension || metadata.raw).toLowerCase()
		const parser = Prism[lang]
		if (!parser) {
			// No-op
			return
		}
		setLang(lang)
		setHTML(window.Prism.highlight(data, parser, lang))
	}, [metadata, data])

	return (
		<div className="my-2 px-6 py-4 whitespace-pre-wrap break-words font-mono text-sm leading-snug bg-white rounded-lg shadow-hero-lg" style={{ ...tabSize(2), ...style }} {...props}>
			{html ? (
				<span
					className={!lang ? null : `language-${lang}`}
					dangerouslySetInnerHTML={{
						__html: html,
					}}
				/>
			) : (
				data
			)}
		</div>
	)
}

const ListItem = React.memo(({ depth, syntax, checked, data, ...props }) => (
	<NodeHOC tag="li" className="-ml-5 my-1 flex flex-row">
		<Syntax className="hidden">{"\t".repeat(depth)}</Syntax>
		<Markdown className="mr-2 text-md-blue-a400" style={{ fontFeatureSettings: "'tnum'" }} syntax={[syntax[0].trimStart()]}>
			<div>
				{toInnerReact(data)}
			</div>
		</Markdown>
	</NodeHOC>
))

const TaskItem = React.memo(({ depth, syntax, checked, data, ...props }) => {
	const [value, setValue] = React.useState(checked.value)

	return (
		<NodeHOC tag="li" className="-ml-5 my-1 flex flex-row" style={value && strikeStyle} data-feature-task-item>
			<Syntax className="hidden">{"\t".repeat(depth)}</Syntax>
			<input
				// NOTE: Use md-blue-a200 because md-blue-a400 is
				// too dark
				className="form-checkbox mr-2 text-md-blue-a200"
				style={{
					marginLeft: "calc((2.047 + 0.75) / 16 * -1em)",
					marginTop: "0.375em",
					width: "0.875em",
					height: "0.875em",
				}}
				type="checkbox"
				checked={value}
				onChange={e => setValue(!value)}
			/>
			<div>
				{toInnerReact(data)}
			</div>
		</NodeHOC>
	)
})

// NOTE: Compound component
const List = React.memo(({ id, depth, numbered, data, ...props }) => (
	<NodeHOC id={id} tag={!numbered ? "ul" : "ol"} className="ml-5">
		{data.map(({ type: Type, children: data, ...each }) => (
			<Type key={each.id} data={data} {...each} />
		))}
	</NodeHOC>
))

const Image = React.memo(({ id, syntax, src, alt, data, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	const [hover, setHover] = React.useState(() => readOnly)

	return (
		<NodeHOC id={id} className="relative" onMouseEnter={e => setHover(true)} onMouseLeave={e => setHover(false)}>
			{readOnly && !data ? (
				null
			) : (
				// TODO: Add transition duration-300?
				<div className="absolute inset-0" style={{ opacity: readOnly && !hover ? "0%" : "100%" }}>
					<div className="px-8 flex flex-row justify-center items-end h-full">
						<div className="my-2 px-2 py-1 bg-white rounded shadow-hero truncate">
							<Markdown syntax={syntax}>
								{toInnerReact(data)}
							</Markdown>
						</div>
					</div>
				</div>
			)}
			{/* FIXME: Change to ems */}
			<img className="mx-auto" style={{ minHeight: 8 + 4 + 27 + 4 + 8, maxWidth: 672, maxHeight: 672 / 2 }} src={src} alt={alt} />
		</NodeHOC>
	)
})

const Break = React.memo(({ id, syntax, ...props }) => {
	const { readOnly } = React.useContext(EditorContext)

	return (
		<NodeHOC id={id}>
			{!readOnly ? (
				<Markdown syntax={syntax} />
			) : (
				<hr className="inline-block w-full" style={{ verticalAlign: "15%" }} />
			)}
		</NodeHOC>
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
	const parse = (text, index, { minChars } = { minChars: 1 }) => {
		// Guard: _Em_ and __strong and em__ cannot be nested:
		//
		// https://github.github.com/gfm/#example-369
		if (syntax[0] === "_" && index - 1 >= 0 && (!isASCIIWhitespace(text[index - 1]) && !isASCIIPunctuation(text[index - 1]))) {
			return null
		}
		// Guard: (Some) syntax cannot surround spaces:
		const offset = text.slice(index + syntax.length).search(pattern) + patternOffset
		if (
			offset < minChars ||
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && text[index + syntax.length] === " ") ||           // Exempt <Code> and <A>
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && text[index + syntax.length + offset - 1] === " ") // Exempt <Code> and <A>
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

// Matches a URL terminated by an alphanumeric (word) or
// forward-slash character.
//
// https://tools.ietf.org/html/rfc3986
//
// eslint-disable-next-line no-useless-escape
const urlSafeRe = /^([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%]*)[\w\/]/

// Parses a nested VDOM representation to GFM text.
//
// TODO: https://github.github.com/gfm/#delimiter-stack
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
			// ```Code```
			if (nchars >= "```x```".length && text.slice(index, index + 3) === "```") {
				const parsed = registerType(Code, "```", { recurse: false })(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.object)
				index = parsed.x2
				continue
			// `Code`
			} else if (nchars >= "`x`".length) {
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
		// <A> (1 of 2)
		case char === "h":
			// https://etc
			if (nchars >= HTTPS.length && text.slice(index, index + HTTPS.length) === HTTPS) {
				const matches = urlSafeRe.exec(text.slice(index + HTTPS.length))
				let offset = 0
				if (matches) {
					offset = matches[0].length
				}
				const children = text.slice(index + HTTPS.length, index + HTTPS.length + offset)
				data.push({
					type: A,
					syntax: [HTTPS],
					href: HTTPS + children,
					children,
				})
				index += HTTPS.length + offset - 1
				continue
			// http://etc
			} else if (nchars >= HTTP.length && text.slice(index, index + HTTP.length) === HTTP) {
				const matches = urlSafeRe.exec(text.slice(index + HTTP.length))
				let offset = 0
				if (matches) {
					offset = matches[0].length
				}
				const children = text.slice(index + HTTP.length, index + HTTP.length + offset)
				data.push({
					type: A,
					syntax: [HTTP],
					href: HTTP + children,
					children,
				})
				index += HTTP.length + offset - 1
				continue
			}
			break
		// <A> (2 of 2)
		case char === "[":
			// [Anchor](href)
			if (nchars >= "[x](x)".length) {
				const lhs = registerType(null, "]")(text, index)
				if (!lhs) {
					// No-op
					break
				}
				// Check ( syntax:
				if (lhs.x2 + "]".length < text.length && text[lhs.x2 + "]".length] !== "(") {
					// No-op
					break
				}
				const rhs = registerType(null, ")", { recurse: false })(text, lhs.x2 + "]".length)
				if (!rhs) {
					// No-op
					break
				}
				data.push({
					type: A,
					// syntax: ["[", "](…)"],
					syntax: ["[", `](${rhs.object.children})`],
					href: rhs.object.children.trim(),
					children: lhs.object.children,
				})
				index = rhs.x2
				continue
			}
			break
		default:
			// 😀
			const emoji = emojiTrie.atStart(text.slice(index)) // eslint-disable-line no-case-declarations
			if (emoji) {
				data.push({
					type: Emoji,
					emoji,
					children: emoji.emoji,
				})
				index += emoji.emoji.length - 1
				continue
			}
			break
		}
		if (!data.length || typeof data[data.length - 1] !== "string") {
			data.push(char)
			continue
		}
		data[data.length - 1] += char
	}
	// Return a string or an array of objects:
	if (data.length === 1 && typeof data[0] === "string") {
		return data[0]
	}
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

/* eslint-disable no-multi-spaces, no-useless-escape */
const ListRe              = /^\t*(?:- \[( |x)\] |[\-\+\*] |\d+\. )/
// const UnnumberedListRe = /^\t*[\-\+\*] /
const NumberedListRe      = /^\t*\d+\. /
// const TaskListRe       = /^\t*- \[( |x)\] /
/* eslint-enable no-multi-spaces, no-useless-escape */

// Parses an unnumbered or numbered VDOM representation from
// a range of paragraphs.
function parseList(range) {
	const data = {
		type: List,
		id: uuidv4(),
		depth: 0,
		numbered: NumberedListRe.test(range[0]),
		children: [],
	}
	for (const each of range) {
		const [syntax] = each.match(ListRe)
		const substr = each.slice(syntax.length)
		let ref = data.children
		let deep = 0
		// Count up to a non-tab character:
		const depth = syntax.search(/[^\t]/)
		while (deep < depth) {
			if (!ref.length || ref[ref.length - 1].type !== List) {
				ref.push({
					type: List,
					id: uuidv4(),
					depth: deep + 1, // Eagerly increment
					numbered: NumberedListRe.test(each),
					children: [],
				})
			}
			ref = ref[ref.length - 1].children
			deep++
		}
		let checked = null
		if (syntax.endsWith("- [ ] ") || syntax.endsWith("- [x] ")) {
			const value = syntax[syntax.length - 3] === "x"
			checked = { value }
		}
		ref.push({
			type: !checked ? ListItem : TaskItem,
			id: uuidv4(),
			depth: deep, // Takes precedence
			syntax: [syntax],
			checked,
			children: parseInnerGFM(substr),
		})
	}
	return data
}

// Parses a metadata object from a raw metadata string.
function parseMetadata(raw) {
	// TODO: Add support for URL-based metadata strings?
	const metadata = {
		raw,           // "hello.world"
		filename: "",  // "hello"
		extension: "", // "world"
	}
	const index = raw.lastIndexOf(".")
	if (index === -1 || index + 1 === metadata.length) {
		return metadata
	}
	metadata.filename = raw.slice(0, index)
	metadata.extension = raw.slice(index + 1)
	return metadata
}

// Parses GFM text to a VDOM representation.
function parseGFM(text) {
	const newHash = newHashEpoch()

	const data = []
	const body = text.split("\n")
	// NOTE: Use an index for multiline elements
	for (let index = 0; index < body.length; index++) {
		const each = body[index]
		const char = each.charAt(0)
		const nchars = each.length
		switch (true) {
		// <Header>
		case char === "#":
			// # Header
			// ## Subheader
			// ### H3
			// #### H4
			// ##### H5
			// ###### H6
			if (
				(nchars >= 2 && each.slice(0, 2) === "# ") ||
				(nchars >= 3 && each.slice(0, 3) === "## ") ||
				(nchars >= 4 && each.slice(0, 4) === "### ") ||
				(nchars >= 5 && each.slice(0, 5) === "#### ") ||
				(nchars >= 6 && each.slice(0, 6) === "##### ") ||
				(nchars >= 7 && each.slice(0, 7) === "###### ")
			) {
				const syntax = each.slice(0, each.indexOf(" ") + 1)
				data.push({
					type: [Header, Subheader, H3, H4, H5, H6][syntax.length - 2],
					id: uuidv4(),
					syntax: [syntax],
					hash: newHash(toInnerText(parseInnerGFM(each.slice(syntax.length)))),
					children: parseInnerGFM(each.slice(syntax.length)),
				})
				continue
			}
			break
		// <Blockquote>
		case char === ">":
			// > Blockquote
			if (
				(nchars >= 2 && each.slice(0, 2) === "> ") ||
				(nchars === 1 && each === ">")
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
					type: Blockquote,
					id: uuidv4(),
					children: body.slice(x1, x2).map(each => ({
						type: Paragraph,
						id: uuidv4(), // TODO: Use index?
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
			// ```
			// Code block
			// ```
			if (
				nchars >= 3 &&
				each.slice(0, 3) === "```" &&
				each.slice(3).indexOf("`") === -1 && // Negate backticks
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
				const raw = each.slice(3)
				data.push({
					type: CodeBlock,
					id: uuidv4(),
					syntax: "```",
					metadata: parseMetadata(raw),
					children: body.slice(x1, x2)
						.join("\n")
						.slice(3 + raw.length, -3) // Trim syntax
						.slice(1),                 // Trim start paragraph
				})
				index = x2 - 1
				continue
			}
			break
		// <List>
		case char === "\t" || (
			(char === "-" || char === "+" || char === "*" || (char >= "0" && char <= "9")) && (
				each !== "---" && // Negate break
				each !== "***"    // Negate break
			)
		):
			// - List
			// 1. List
			if (nchars >= 2 && ListRe.test(each)) { // 2 is the fewest characters
				const x1 = index
				let x2 = x1
				x2++
				// Iterate to end syntax:
				while (x2 < body.length) {
					if (body[x2].length < 2 || !ListRe.test(body[x2])) {
						// No-op
						break
					}
					x2++
				}
				const range = body.slice(x1, x2)
				data.push(parseList(range))
				index = x2 - 1
				continue
			}
			break
		// <Image>
		//
		// TODO: Move to parseInnerGFM to support
		// [![Image](a:href)](b:href) syntax?
		case char === "!":
			// ![Image](href)
			if (nchars >= "![](x)".length) {
				const lhs = registerType(null, "]")(each, "!".length, { minChars: 0 })
				if (!lhs) {
					// No-op
					break
				}
				// Check ( syntax:
				if (lhs.x2 + "]".length < nchars && each[lhs.x2 + 1] !== "(") {
					// No-op
					break
				}
				const rhs = registerType(null, ")", { recurse: false })(each, lhs.x2 + "]".length)
				if (!rhs) {
					// No-op
					break
				}
				data.push({
					type: Image,
					id: uuidv4(),
					syntax: ["![", `](${rhs.object.children})`],
					src: rhs.object.children,
					alt: toInnerText(lhs.object.children),
					children: lhs.object.children,
				})
				continue
			}
			break
		// <Break>
		case char === "-" || char === "*":
			// --- or ***
			if (nchars === 3 && each === char.repeat(3)) {
				data.push({
					type: Break,
					id: uuidv4(),
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
			type: Paragraph,
			id: uuidv4(),
			children: parseInnerGFM(each),
		})
	}
	return data
}

// Parses a nested VDOM representation to React components.
function toInnerReact(children) {
	if (children === null || typeof children === "string") {
		return children
	}
	const components = []
	for (const each of children) {
		if (each === null || typeof each === "string") {
			components.push(toInnerReact(each))
			continue
		}
		const { type: Type, ...props } = each
		components.push((
			<Type key={components.length} {...props}>
				{toInnerReact(props.children)}
			</Type>
		))
	}
	return components
}

// Parses a nested VDOM representation to text.
function toInnerText(children, options = { markdown: false }) {
	let text = ""
	if (children === null || typeof children === "string") {
		return children || ""
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			text += toInnerText(each, options)
			continue
		}
		const [s1, s2] = parseSyntax(each.syntax)
		if (options.markdown) {
			text += typeof s1 !== "function" ? s1 : s1(each)
		}
		text += toInnerText(each.children, options)
		if (options.markdown) {
			text += typeof s2 !== "function" ? s2 : s2(each)
		}
	}
	return text
}

// Parses a VDOM representation to text.
function toText(data, options = { markdown: false }) {
	let text = ""
	for (const each of data) {
		const [s1, s2] = parseSyntax(each.syntax)
		if (options.markdown) {
			text += typeof s1 !== "function" ? s1 : s1(each)
		}
		if (each.type === Break) {
			// No-op
		} else if (each.type === Blockquote) {
			text += toText(each.children, options)
		} else {
			text += toInnerText(each.children, options)
		}
		if (options.markdown) {
			text += typeof s2 !== "function" ? s2 : s2(each)
		}
		if (each !== data[data.length - 1]) {
			text += "\n"
		}
	}
	return text
}

// Parses a nested VDOM representation to an HTML string.
function toInnerHTML(children) {
	let html = ""
	if (children === null || typeof children === "string") {
		return escape(children) || "<br>"
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			html += toInnerHTML(each)
			continue
		}
		const [s1, s2] = cmapHTML[each.type.type || each.type]
		html += typeof s1 !== "function" ? s1 : s1(each)
		html += toInnerHTML(each.children)
		html += typeof s2 !== "function" ? s2 : s2(each)
	}
	return html
}

// Parses a VDOM representation to an HTML string.
function toHTML(data) {
	let html = ""
	for (const each of data) {
		const [s1, s2] = cmapHTML[each.type.type || each.type]
		html += typeof s1 !== "function" ? s1 : s1(each)
		if (each.type === Break) {
			// No-op
		} else if (each.type === Blockquote || each.type === List) {
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
		html += typeof s2 !== "function" ? s2 : s2(each)
		if (each !== data[data.length - 1]) {
			html += "\n"
		}
	}
	return html
}

// Parses a VDOM representation to a JSON string.
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

const EditorContext = React.createContext()

// Maps type references to names or HTML.
const cmap = new Map()
const cmapHTML = new Map()

;(() => {
	/* eslint-disable no-multi-spaces */
	cmap[Emoji]           = "Emoji"
	cmap[Escape]          = "Escape"
	cmap[Em]              = "Em"
	cmap[Strong]          = "Strong"
	cmap[StrongAndEm]     = "StrongAndEm"
	cmap[Code]            = "Code"
	cmap[Strike]          = "Strike"
	cmap[A]               = "A"
	cmap[Header.type]     = "Header"
	cmap[Subheader.type]  = "Subheader"
	cmap[H3.type]         = "H3"
	cmap[H4.type]         = "H4"
	cmap[H5.type]         = "H5"
	cmap[H6.type]         = "H6"
	cmap[Paragraph.type]  = "Paragraph"
	cmap[Blockquote.type] = "Blockquote"
	cmap[CodeBlock.type]  = "CodeBlock"
	cmap[ListItem.type]   = "ListItem"
	cmap[TaskItem.type]   = "TaskItem"
	cmap[List.type]       = "List"
	cmap[Image.type]      = "Image"
	cmap[Break.type]      = "Break"

	cmapHTML[Emoji]           = [data => `<span aria-label="${data.emoji.description}" role="img">`, "</span>"]
	cmapHTML[Escape]          = ["", ""] // No-op
	cmapHTML[Em]              = ["<em>", "</em>"]
	cmapHTML[Strong]          = ["<strong>", "</strong>"]
	cmapHTML[StrongAndEm]     = ["<strong><em>", "</em></strong>"]
	cmapHTML[Code]            = ["<code>", "</code>"]
	cmapHTML[Strike]          = ["<strike>", "</strike>"]
	cmapHTML[A]               = [data => `<a href="${data.href}">`, "</a>"]
	cmapHTML[Header.type]     = [data => `<a href="#${data.hash}">\n\t<h1 id="${data.hash}">\n\t\t`, "\n\t</h1>\n</a>"]
	cmapHTML[Subheader.type]  = [data => `<a href="#${data.hash}">\n\t<h2 id="${data.hash}">\n\t\t`, "\n\t</h2>\n</a>"]
	cmapHTML[H3.type]         = [data => `<a href="#${data.hash}">\n\t<h3 id="${data.hash}">\n\t\t`, "\n\t</h3>\n</a>"]
	cmapHTML[H4.type]         = [data => `<a href="#${data.hash}">\n\t<h4 id="${data.hash}">\n\t\t`, "\n\t</h4>\n</a>"]
	cmapHTML[H5.type]         = [data => `<a href="#${data.hash}">\n\t<h5 id="${data.hash}">\n\t\t`, "\n\t</h5>\n</a>"]
	cmapHTML[H6.type]         = [data => `<a href="#${data.hash}">\n\t<h6 id="${data.hash}">\n\t\t`, "\n\t</h6>\n</a>"]
	cmapHTML[Paragraph.type]  = ["<p>\n\t", "\n</p>"]
	cmapHTML[Blockquote.type] = ["<blockquote>", "</blockquote>"]
	cmapHTML[CodeBlock.type]  = [data => `<pre${!data.metadata.extension || data.metadata.raw ? "" : ` class="language-${(data.metadata.extension || data.metadata.raw).toLowerCase()}"`}><code>`, "</code></pre>"]
	cmapHTML[ListItem.type]   = ["<li>\n\t", "\n</li>"]
	cmapHTML[TaskItem.type]   = ["<li>\n\t", "\n</li>"] // TODO
	cmapHTML[List.type]       = [data => `<${!data.numbered ? "ul" : "ol"}>`, data => `</${!data.numbered ? "ul" : "ol"}>`]
	cmapHTML[Image.type]      = [data => `<img src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`, ""] // Leaf node
	cmapHTML[Break.type]      = ["<hr>", ""] // Leaf node
	/* eslint-enable no-multi-spaces */
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
			<Provider value={state}>
				{state.data.map(({ type: Type, children: data, ...each }) => (
					<Type key={each.id} data={data} {...each} />
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
			// 	each.type === Header ||
			// 	each.type === Subheader ||
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

				className: `codex-editor${!className ? "" : ` ${className}`}`,

				style: {
					// wordWrap: "break-word", // Not working
					caretColor: "black",
					outline: "none",
					...style,
				},

				// contentEditable: !state.readOnly,
				// suppressContentEditableWarning: !state.readOnly,

				"data-feature-read-only": state.readOnly || null
			},
		)
	)
}

const LOCALSTORAGE_KEY = "codex-app-v2.1"

const KEY_CODE_TAB = 9

function tabSize(n) {
	const style = {
		MozTabSize: n,
		tabSize: n,
	}
	return style
}

const App = props => {
	const ref = React.useRef()
	const debugCSSRef = React.useRef()

	const [debugCSS, setDebugCSS] = React.useState(false)

	const mounted = React.useRef()
	React.useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		if (!debugCSS) {
			debugCSSRef.current.classList.remove("debug-css")
		} else {
			debugCSSRef.current.classList.add("debug-css")
		}
	}, [debugCSS])

	// <textarea> (1 of 2):
	const [value, setValue] = React.useState(() => {
		const cache = localStorage.getItem(LOCALSTORAGE_KEY)
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

Why stop there?! Why not images! ⚡️

![**Star Wars**](https://camo.githubusercontent.com/aa4f8ab810278debb3b3bc2a2dc46819650aa11e/68747470733a2f2f6d2e6d656469612d616d617a6f6e2e636f6d2f696d616765732f4d2f4d5635424e7a49344e6d466b4e6a45744e6d51774d4330305a5442684c546b774f4759744e6a6731595455794f57593359325534586b4579586b46716347646551585a335a584e735a586b402e5f56315f55583437375f4352302c302c3437372c3236385f414c5f2e6a7067)

Or emojis?!

😂

Even [links](https://google.com) are supported now. Crazy, huh?

**Try pressing the \`Text\`, \`Markdown\`, \`HTML\` and \`JSON\` buttons at the top; these convert the parsed markdown data structure to various formats.** This may help you better understand what’s going on behind the hood.
`.trim()
	})

	// <textarea> (2 of 2):
	React.useEffect(() => {
		localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ data: value }))
	}, [value])

	// Create state:
	const [state, setState] = React.useState(() => ({
		// TODO: Use new Enum pattern
		renderMode: "markdown", // E.g. "text" || "markdown" || "html" || "json"
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
			setText(toText(state.data)) // Test no-markdown output
			// setHTML(`<article class="codex-output">\n${
			// 	toHTML(state.data)
			// 		.split("\n")
			// 		.map(each => `\t${each}`)
			// 		.join("\n")
			// }\n</article>`)
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
			<div className="px-6 py-32 grid grid-cols-2 gap-12 w-full">

				{/* Read-only button: */}
				<div className="-my-1 p-3 fixed right-0 top-0 z-30">
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
										Toggle read-only: {(`${state.readOnly}`)}
									</button>
									<button
										className="mx-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
										onPointerDown={e => e.preventDefault()}
										onClick={e => setDebugCSS(!debugCSS)}
									>
										Toggle CSS debugger: {(`${debugCSS}`)}
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
					style={tabSize(2)}
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
				<div ref={debugCSSRef}>
					<DocumentTitle title={state.meta && state.meta.title}>
						{state.renderMode === "text" && (
							<CodeBlockStandalone
								style={{ margin: "-0.5em 0", ...tabSize(2) }}
								metadata={parseMetadata("text")}
								data={`${text}\n`}
							/>
						)}
						{state.renderMode === "markdown" && (
							<Editor
								className="text-lg"
								style={tabSize(4)}
								state={state}
								setState={setState}
							/>
						)}
						{state.renderMode === "html" && (
							<CodeBlockStandalone
								style={{ margin: "-0.5em 0", ...tabSize(2) }}
								metadata={parseMetadata("html")}
								data={`${html}\n`}
							/>
						)}
						{state.renderMode === "json" && (
							<CodeBlockStandalone
								style={{ margin: "-0.5em 0", ...tabSize(2) }}
								metadata={parseMetadata("json")}
								data={`${json}\n`}
							/>
						)}
					</DocumentTitle>
				</div>

			</div>
		</div>
	)
}

export default App
