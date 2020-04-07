import EditorContext from "./EditorContext"
import escape from "lodash/escape"
import Prism from "../Prism"
import React from "react"
import ReactDOM from "react-dom"
import useEditorState from "./useEditorState"
import uuidv4 from "uuid/v4"
import { atStart as emojiAtStart } from "emoji-trie"

import {
	CompoundNode,
	Node,
} from "./HOC"

import {
	HTTP,
	HTTPS,
	isASCIIPunctuation,
	isASCIIWhitespace,
	safeURLRe,
} from "./spec"

// Shared attributes.
const attrs = {
	code: {
		style: {
			MozTabSize: 2,
			tabSize: 2,
		},
		spellCheck: false,
	},
	strike: {
		style: {
			"--red-100": "var(--gray-100)",
			"--red-600": "currentColor",
			"--md-blue-a400": "currentColor",
			"textDecoration": "line-through",
			"color": "var(--gray-500)",
		},
	},
	a: {
		target: "_blank",
		rel: "noopener noreferrer",
	},
	li: {
		style: {
			MozTabSize: 0,
			tabSize: 0,
			fontFeatureSettings: "'tnum'",
		},
	},
}

// Gets syntax from a string or an array of strings.
function getSyntax(syntax) {
	let startSyntax = ""
	let endSyntax = ""
	if (syntax === null) {
		// No-op
	} else if (typeof syntax === "string") {
		startSyntax = syntax
		endSyntax = syntax
	} else if (Array.isArray(syntax)) {
		startSyntax = syntax[0]
		if (syntax.length === 2) {
			endSyntax = syntax[1]
		}
	}
	return [startSyntax, endSyntax]
}

const Syntax = props => {
	const [state] = useEditorState()
	if (!props.children || state.readOnly) {
		return null
	}
	// NOTE: props.className doesn’t concatenate
	return <span className="text-md-blue-a400" {...props} />
}

const Markdown = ({ syntax, ...props }) => {
	const [startSyntax, endSyntax] = getSyntax(syntax)
	return (
		<React.Fragment>

			{/* LHS */}
			<Syntax {...props}>
				{startSyntax}
			</Syntax>

			{/* RHS */}
			{props.children}
			<Syntax {...props}>
				{endSyntax}
			</Syntax>

		</React.Fragment>
	)
}

const Emoji = ({ description, children }) => (
	<span className="emoji" aria-label={description} role="img">
		<Markdown>
			{children}
		</Markdown>
	</span>
)

const Escape = ({ syntax, children }) => (
	<span>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

const Em = ({ syntax, children }) => (
	<span className="italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

const Strong = ({ syntax, children }) => (
	<span className="font-semibold">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

const StrongAndEm = ({ syntax, children }) => (
	<span className="font-semibold italic">
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

const Code = ({ syntax, children }) => (
	<span className="py-px font-mono text-sm text-red-600 bg-red-100 rounded" {...attrs.code}>
		<Markdown className="text-red-600" syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

const Strike = ({ syntax, children }) => (
	<span {...attrs.strike}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</span>
)

const A = ({ syntax, href, children }) => (
	<a className="underline text-md-blue-a400" href={href} {...attrs.a}>
		<Markdown syntax={!children || syntax}>
			{children || syntax}
		</Markdown>
	</a>
)

// Trims extraneous spaces from a string.
function trimAny(str) {
	const trimmed = str
		.replace(/ +/, " ") // Trims extra spaces
		.trim() // Trims start and end spaces
	return trimmed
}

const headerClassNames = {
	h1: trimAny("font-medium   text-3xl -tracking-px leading-tight"),
	h2: trimAny("font-medium   text-2xl -tracking-px leading-tight"),
	h3: trimAny("font-semibold text-xl  -tracking-px leading-tight"),
	h4: trimAny("font-semibold text-xl  -tracking-px leading-tight"),
	h5: trimAny("font-semibold text-xl  -tracking-px leading-tight"),
	h6: trimAny("font-semibold text-xl  -tracking-px leading-tight"),
}

const Header = React.memo(({ tag, id, syntax, hash, data }) => (
	// NOTE: Don’t use <Node tag={tag} ...>
	<Node id={id}>
		<a id={hash} href={`#${hash}`}>
			<div className={headerClassNames[tag]}>
				<Markdown syntax={syntax}>
					{toInnerReact(data) || (
						<br />
					)}
				</Markdown>
			</div>
		</a>
	</Node>
))

const Paragraph = React.memo(({ id, emojis, data }) => (
	<Node id={id} className={!emojis ? null : `emojis emojis-${data.length}`}>
		{toInnerReact(data) || (
			<br />
		)}
	</Node>
))

// NOTE: Compound component
const Blockquote = React.memo(({ id, data }) => {
	const [state] = useEditorState()

	const compoundNodeStyle = state.readOnly && { boxShadow: "inset 0.125em 0 var(--md-blue-a400)" }
	const eachStyle = state.readOnly && { paddingLeft: "calc((14.266 + 8) / 16 * 1em)" }
	return (
		<CompoundNode id={id} style={compoundNodeStyle}>
			{data.map((each, index) => (
				<Node key={each.id} id={each.id} className="my-1 text-md-blue-a400" style={eachStyle}>
					<Markdown className="mr-2 text-md-blue-a400" syntax={each.syntax}>
						{toInnerReact(each.children) || (
							<br />
						)}
					</Markdown>
				</Node>
			))}
		</CompoundNode>
	)
})

// NOTE: Compound component
const CodeBlock = React.memo(({ id, syntax, lang, data }) => {
	const [state] = useEditorState()

	const [html, setHTML] = React.useState(null)

	React.useEffect(() => {
		if (!lang) {
			// No-op
			return
		}
		const parser = Prism[lang]
		if (!parser) {
			// No-op
			return
		}
		setHTML((
			<div className={lang && `language-${lang}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(data, parser, lang),
			}} />
		))
	}, [lang, data])

	return (
		// NOTE: Doesn’t use py-4 because of <Markdown>
		<CompoundNode className="-mx-6 px-6 border" {...attrs.code}>
			<div className="break-words font-mono text-sm leading-snug">
				<Node className="py-px leading-none text-md-blue-a200">
					<Markdown syntax={[syntax[0]]}>
						{state.readOnly && (
							<br />
						)}
					</Markdown>
				</Node>
				<Node>
					{html || (
						data
					)}
				</Node>
				<Node className="py-px leading-none text-md-blue-a200">
					<Markdown syntax={[syntax[1]]}>
						{state.readOnly && (
							<br />
						)}
					</Markdown>
				</Node>
			</div>
		</CompoundNode>
	)
})

const ListItem = React.memo(({ syntax, depth, checked, data }) => (
	<Node tag="li" className="-ml-5 my-1 flex flex-row">
		<Markdown className="mr-2 text-md-blue-a400" syntax={syntax} {...attrs.li}>
			<span>{toInnerReact(data)}</span>
		</Markdown>
	</Node>
))

const Checkbox = ({ className, ...props }) => (
	<input className={`form-checkbox ${className}`} type="checkbox" {...props} />
)

// Prepares a checked state and functions e.g. {...attrs}.
function useChecked(initialValue) {
	const [checked, setChecked] = React.useState(initialValue)
	const attrs = {
		checked,
		onChange: e => {
			setChecked(!checked)
		},
	}
	return [checked, attrs]
}

const TaskItem = React.memo(({ syntax, checked, data }) => {
	const [$checked, $attrs] = useChecked(checked.value)

	const checkboxStyle = {
		margin: "0.1875em 0.5em 0 calc(((14 + 2) - 11.438) / 16 * -1em)",
		borderRadius: "0.3125em",
	}
	return (
		<Node tag="li" className="checked -ml-5 my-1 flex flex-row" style={$checked && attrs.strike.style}>
			<Markdown className="hidden" syntax={syntax}>
				{/* NOTE: Use md-blue-a200 because md-blue-a400 is
				too dark and overwritten by attrs.strike.style */}
				<Checkbox className="flex-shrink-0 w-4 h-4 text-md-blue-a200 shadow transition duration-150" style={checkboxStyle} {...$attrs} />
				<span>{toInnerReact(data)}</span>
			</Markdown>
		</Node>
	)
})

// NOTE: Compound component
const List = React.memo(({ tag, id, data }) => (
	<Node tag={tag} id={id} className="ml-5">
		{data.map(({ type: Type, children: data, ...each }) => (
			<Type key={each.id} data={data} {...each} />
		))}
	</Node>
))

const Caption = ({ syntax, data }) => (
	<div className="px-2 py-1 bg-white rounded shadow-hero truncate pointer-events-auto">
		<Markdown syntax={syntax}>
			{toInnerReact(data)}
		</Markdown>
	</div>
)

// Prepares a hovered state and functions e.g. {...attrs}.
function useHovered(initialValue) {
	const [hovered, setHovered] = React.useState(initialValue)
	const attrs = {
		onMouseEnter: e => {
			setHovered(true)
		},
		onMouseLeave: e => {
			setHovered(false)
		},
	}
	return [hovered, attrs]
}

const Image = React.memo(({ id, syntax, src, alt, data }) => {
	const [state] = useEditorState()

	const [loaded, setLoaded] = React.useState(false)
	const [hovered, $attrs] = useHovered(state.readOnly)

	const divStyle = {
		opacity: state.readOnly && (!data || !hovered) ? "0%" : "100%",
	}
	// TODO: Guard state.rect?
	//
	// let imgStyle = null
	// if (state.rect) {
	// 	Object.assign(imgStyle,
	// 		maxWidth:  state.rect && state.rect.width,
	// 		maxHeight: state.rect && state.rect.width * 10 / 16,
	// 	})
	// }
	const imgStyle = {
		// minHeight: "3em",
		maxWidth:  state.rect && state.rect.width,
		minHeight: !loaded ? state.rect && state.rect.width * 9 / 16 : 0,
		maxHeight: state.rect && state.rect.width * 9 / 16,
	}
	return (
		<Node id={id} className="relative flex flex-row justify-center">
			<div className="absolute inset-0 pointer-events-none" style={divStyle}>
				<div className="px-8 py-2 flex flex-row justify-center items-end h-full">
					<Caption syntax={syntax} data={data} />
				</div>
			</div>
			{/* <div style={{opacity: !loaded ? "0%" : "100%" }} {...$attrs}> */}
			<div className={!loaded ? "w-full text-transparent bg-gray-100" : ""} {...$attrs}>
				<img className="mx-auto" style={imgStyle} src={src} alt={alt} onLoad={e => setLoaded(true)} />
			</div>
		</Node>
	)
})

const Break = React.memo(({ id, syntax }) => {
	const [state] = useEditorState()
	return (
		<Node id={id}>
			<Markdown syntax={syntax}>
				{state.readOnly && (
					<hr className="inline-block w-full" style={{ verticalAlign: "15%" }} />
				)}
			</Markdown>
		</Node>
	)
})

// Registers a type for parseInnerGFM.
//
// TODO: Refactor to parseInner({ type, syntax, text, index, toInnerHTML, minOffset })?
function registerType(type, syntax, { toInnerHTML } = { toInnerHTML: true }) {
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
	const parse = (text, index, { minOffset } = { minOffset: 1 }) => {
		// Guard: Character before start underscore syntax must
		// be whitespace or punctutation:
		//
		// https://github.github.com/gfm/#example-369
		if (syntax[0] === "_" && index - 1 >= 0 && (!isASCIIWhitespace(text[index - 1]) && !isASCIIPunctuation(text[index - 1]))) {
			return null
		}
		// Guard: Most syntax cannot surround spaces:
		const offset = text.slice(index + syntax.length).search(pattern) + patternOffset
		if (
			offset < minOffset ||
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && isASCIIWhitespace(text[index + syntax.length])) ||           // Exempt <Code> and <A>
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && isASCIIWhitespace(text[index + syntax.length + offset - 1])) // Exempt <Code> and <A>
		) {
			return null
		}
		index += syntax.length
		const data = {
			type,
			syntax,
			children: !toInnerHTML
				? text.slice(index, index + offset)
				: parseInnerGFM(text.slice(index, index + offset)),
		}
		index += syntax.length + offset
		return { data, x2: index }
	}
	return parse
}

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
	 		if (index + 1 < text.length && isASCIIPunctuation(text[index + 1])) {
				data.push({
					type: Escape,
					syntax: [char],
					children: text[index + 1],
				})
				index++
				continue
			}
			break
		// <StrongEm>
		// <Strong>
		// <Em>
		case char === "*" || char === "_":
			// ***Strong and em***
			if (nchars >= "***x***".length && text.slice(index, index + 3) === char.repeat(3)) {
				const parsed = registerType(StrongAndEm, char.repeat(3))(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// **Strong** or __strong__
			} else if (nchars >= "**x**".length && text.slice(index, index + 2) === char.repeat(2)) {
				const parsed = registerType(Strong, char.repeat(2))(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// _Emphasis_ or *emphasis*
			} else if (nchars >= "*x*".length) {
				const parsed = registerType(Em, char)(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
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
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// ~Strike~
			} else if (nchars >= "~x~".length) {
				const parsed = registerType(Strike, "~")(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			}
			break
		// <Code>
		case char === "`":
			// ```Code```
			if (nchars >= "```x```".length && text.slice(index, index + 3) === "```") {
				const parsed = registerType(Code, "```", { toInnerHTML: false })(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// `Code`
			} else if (nchars >= "`x`".length) {
				const parsed = registerType(Code, "`", { toInnerHTML: false })(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			}
			break
		// <A> (1 of 2)
		case char === "h":
			// https://
			//
			// TODO: Eat "www."
			if (nchars >= HTTPS.length && text.slice(index, index + HTTPS.length) === HTTPS) {
				const matches = safeURLRe.exec(text.slice(index))
				let offset = 0
				if (matches) {
					offset = matches[0].length
				}
				data.push({
					type: A,
					syntax: [HTTPS],
					href: matches[0],
					children: matches[0].slice(HTTPS.length),
				})
				index += offset - 1
				continue
			// http://
			//
			// TODO: Eat "www."
			} else if (nchars >= HTTP.length && text.slice(index, index + HTTP.length) === HTTP) {
				const matches = safeURLRe.exec(text.slice(index))
				let offset = 0
				if (matches) {
					offset = matches[0].length
				}
				data.push({
					type: A,
					syntax: [HTTP],
					href: matches[0],
					children: matches[0].slice(HTTP.length),
				})
				index += offset - 1
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
				if (lhs.x2 < text.length && text[lhs.x2] !== "(") {
					// No-op
					break
				}
				const rhs = registerType(null, ")", { toInnerHTML: false })(text, lhs.x2)
				if (!rhs) {
					// No-op
					break
				}
				data.push({
					type: A,
					// syntax: ["[", "](…)"],
					syntax: ["[", `](${rhs.data.children})`],
					href: rhs.data.children.trim(),
					children: lhs.data.children,
				})
				index = rhs.x2 - 1
				continue
			}
			break
		default:
			// 😀
			//
			// eslint-disable-next-line no-case-declarations
			const e = emojiAtStart(text.slice(index))
			if (e && e.status === "fully-qualified") {
				data.push({
					type: Emoji,
					description: e.description,
					children: e.emoji,
				})
				index += e.emoji.length - 1
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
		const hash = str.toLowerCase()
			// Convert spaces and dashes to one dash:
			.replace(/(\s+|-+)/g, "-")
			// Drop URL unsafe characters:
			.replace(/[^\w\-\.\~]/g, "") // eslint-disable-line no-useless-escape
			// Trim dashes:
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
const AnyListRe      = /^\t*(?:- \[( |x)\] |[\-\+\*] |\d+\. )/
const NumberedListRe = /^\t*\d+\. /
/* eslint-enable no-multi-spaces, no-useless-escape */

// Parses a list-based VDOM representation from a range of
// paragraphs.
function parseList(range) {
	const data = {
		type: List,
		tag: !NumberedListRe.test(range[0]) ? "ul" : "ol",
		id: uuidv4(),
		children: [],
	}
	for (const each of range) {
		const [syntax] = each.match(AnyListRe)
		const substr = each.slice(syntax.length)
		let ref = data.children
		let deep = 0
		const depth = syntax.search(/[^\t]/)
		while (deep < depth) {
			if (!ref.length || ref[ref.length - 1].type !== List) {
				ref.push({
					type: List,
					tag: !NumberedListRe.test(each) ? "ul" : "ol",
					id: uuidv4(),
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
			syntax: [syntax],
			checked,
			children: parseInnerGFM(substr),
		})
	}
	return data
}

// Parses GFM text to a VDOM representation.
export function parseGFM(text) {
	const newHash = newHashEpoch()

	const data = []
	const body = text.split("\n")
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
					type: Header,
					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
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
						id: uuidv4(),
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
				data.push({
					type: CodeBlock,
					id: uuidv4(),
					syntax: [body[x1], body[x2 - 1]],
					lang: each.slice(3).split(".").slice(-1)[0].toLowerCase(),
					children: body.slice(x1, x2).join("\n")
						.slice(each.length, -3) // Trim syntax
						.slice(1),              // Trim start paragraph
				})
				index = x2 - 1
				continue
			}
			break
		// <List>
		case char === "\t" || (
			(char === "-" || char === "+" || char === "*" || (char >= "0" && char <= "9")) &&
			(each !== "---" && each !== "***") // Negate break
		):
			// - List
			// 1. List
			if (nchars >= "- ".length && AnyListRe.test(each)) {
				const x1 = index
				let x2 = x1
				x2++
				// Iterate to end syntax:
				while (x2 < body.length) {
					if (body[x2].length < 2 || !AnyListRe.test(body[x2])) {
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
		// [![Image](href)](href) syntax?
		case char === "!":
			// ![Image](href)
			if (nchars >= "![](x)".length) {
				const lhs = registerType(null, "]")(each, "!".length, { minOffset: 0 })
				if (!lhs) {
					// No-op
					break
				}
				// Check ( syntax:
				if (lhs.x2 < nchars && each[lhs.x2] !== "(") {
					// No-op
					break
				}
				const rhs = registerType(null, ")", { toInnerHTML: false })(each, lhs.x2)
				if (!rhs) {
					// No-op
					break
				}
				data.push({
					type: Image,
					id: uuidv4(),
					// syntax: ["![", "](…)"],
					syntax: ["![", `](${rhs.data.children})`],
					src: rhs.data.children,
					alt: toInnerText(lhs.data.children),
					children: lhs.data.children,
				})
				continue
			}
			break
		// <Break>
		case char === "-" || char === "*":
			// ---
			// ***
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
		const children = parseInnerGFM(each)
		data.push({
			type: Paragraph,
			id: uuidv4(),
			emojis: (
				children &&
				children.every &&
				children.every(each => each.type === Emoji)
			),
			children,
		})
	}
	return data
}

// Reads syntax from a string or function-return.
function readSyntax(strOrFn, args) {
	// if (typeof strOrFn !== "string" && typeof strOrFn !== "function") {
	// 	throw new Error(`readSyntax: expected a string or function, got ${typeof strOrFn}`)
	// }
	if (typeof strOrFn === "string") {
		const str = strOrFn
		return str
	}
	const fn = strOrFn
	return fn(args)
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
function toInnerText(children, opts = { gfm: false }) {
	let str = ""
	if (children === null || typeof children === "string") {
		return children || ""
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			str += toInnerText(each, opts)
			continue
		}
		const fn = cmapText[each.type.type || each.type]
		str += fn(each)
	}
	return str
}

// Parses a VDOM representation to text.
export function toText(data, opts = { gfm: false }) {
	let str = ""
	for (const each of data) {
		const fn = cmapText[each.type.type || each.type]
		str += fn(each)
		if (each !== data[data.length - 1]) {
			str += "\n"
		}
	}
	return str
}

// Parses a nested VDOM representation to an HTML string.
function toInnerHTML(children) {
	let str = ""
	if (children === null || typeof children === "string") {
		return escape(children) || "<br>"
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			str += toInnerHTML(each)
			continue
		}
		const fn = cmapHTML[each.type.type || each.type]
		str += fn(each)
	}
	return str
}

// Parses a VDOM representation to an HTML string.
export function toHTML(data) {
	let str = ""
	for (const each of data) {
		const fn = cmapHTML[each.type.type || each.type]
		str += fn(each)
		if (each !== data[data.length - 1]) {
			str += "\n"
		}
	}
	return str
}

// Component map.
//
/* eslint-disable no-multi-spaces */
const cmapText = new Map()
const cmapGFM  = new Map()
const cmapHTML = new Map()
/* eslint-enable no-multi-spaces */

;(() => {
	/* eslint-disable no-multi-spaces */
	cmapText[Escape]          = data => data.children
	cmapText[Emoji]           = data => toInnerText(data.children)
	cmapText[Em]              = data => toInnerText(data.children)
	cmapText[Strong]          = data => toInnerText(data.children)
	cmapText[StrongAndEm]     = data => toInnerText(data.children)
	cmapText[Code]            = data => data.children
	cmapText[Strike]          = data => toInnerText(data.children)
	cmapText[A]               = data => toInnerText(data.children)
	cmapText[Header.type]     = data => toInnerText(data.children)
	cmapText[Paragraph.type]  = data => toInnerText(data.children)
	cmapText[Blockquote.type] = data => toText(data.children)
	cmapText[CodeBlock.type]  = data => data.children
	cmapText[ListItem.type]   = data => toInnerText(data.children)
	cmapText[TaskItem.type]   = data => toInnerText(data.children)
	cmapText[List.type]       = data => toText(data.children)
	cmapText[Image.type]      = data => toInnerText(data.children)
	cmapText[Break.type]      = data => data.syntax

	cmapGFM[Escape]           = data => data.syntax + data.children
	cmapGFM[Emoji]            = data => toInnerText(data.children, { gfm: true }) // TODO: Rename to gfm
	cmapGFM[Em]               = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[Strong]           = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[StrongAndEm]      = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[Code]             = data => data.syntax[0] + data.children + data.syntax[1]
	cmapGFM[Strike]           = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[A]                = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[Header.type]      = data => data.syntax[0] + toInnerText(data.children, { gfm: true })
	cmapGFM[Paragraph.type]   = data => toInnerText(data.children, { gfm: true })
	cmapGFM[Blockquote.type]  = data => toText(data.children, { gfm: true })
	cmapGFM[CodeBlock.type]   = data => data.syntax[0] + data.children + data.syntax[1]
	cmapGFM[ListItem.type]    = data => toInnerText(data.children, { gfm: true })
	cmapGFM[TaskItem.type]    = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[List.type]        = data => data.syntax[0] + toText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[Image.type]       = data => data.syntax[0] + toInnerText(data.children, { gfm: true }) + data.syntax[1]
	cmapGFM[Break.type]       = data => data.syntax

	cmapHTML[Escape]          = data => data.children
	cmapHTML[Emoji]           = data => `<span aria-label="${data.description}" role="img">${toInnerHTML(data.children)}</span>`
	cmapHTML[Em]              = data => `<em>${toInnerHTML(data.children)}</em>`
	cmapHTML[Strong]          = data => `<strong>${toInnerHTML(data.children)}</strong>`
	cmapHTML[StrongAndEm]     = data => `<strong><em>${toInnerHTML(data.children)}</em></strong>`
	cmapHTML[Code]            = data => `<code>${toInnerHTML(data.children)}</code>`
	cmapHTML[Strike]          = data => `<strike>${toInnerHTML(data.children)}</strike>`
	cmapHTML[A]               = data => `<a href="${data.href}">${toInnerHTML(data.children)}</a>`
	cmapHTML[Header.type]     = data => `<a href="#${data.hash}">\n\t<h1 id="${data.hash}">\n\t\t${toInnerHTML(data.children)}\n\t</h1>\n</a>`
	cmapHTML[Paragraph.type]  = data => `<p>\n\t${toInnerHTML(data.children)}\n</p>`
	cmapHTML[Blockquote.type] = data => `<blockquote>${`\n${toHTML(data.children).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	cmapHTML[CodeBlock.type]  = data => `<pre${!data.lang ? "" : ` class="language-${(data.lang).toLowerCase()}"`}><code>${toInnerHTML(data.children)}</code></pre>`
	cmapHTML[ListItem.type]   = data => `<li>\n\t${toInnerHTML(data.children)}\n</li>`
	cmapHTML[TaskItem.type]   = data => `<li>\n\t<input type="checkbox"${!data.checked || !data.checked.value ? "" : " checked"}>\n\t${toInnerHTML(data.children)}\n</li>`
	cmapHTML[List.type]       = data => `<${data.tag}>${`\n${toHTML(data.children).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	cmapHTML[Image.type]      = data => `<img src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`
	cmapHTML[Break.type]      = data => "<hr>"
	/* eslint-enable no-multi-spaces */
})()

export const Editor = React.forwardRef(({ className, style, state, setState, ...props }, ref) => {

	// Rerender the React-managed DOM when state.data changes:
	React.useLayoutEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			<Provider value={[state, setState]}>
				{state.data.map(({ type: Type, children: data, ...each }) => (
					<Type key={each.id} data={data} {...each} />
				))}
			</Provider>,
			ref.current,
		)
	}, [state, setState, ref])

	return (
		React.createElement(
			"div",
			{
				ref,

				"className": !className
					? "codex-editor"
					: `codex-editor ${className}`,

				"style": {
					MozTabSize: 4,
					tabSize: 4,

					// // contenteditable:
					// caretColor: "black",
					//
					// // Imperative styles for contenteditable:
					// whiteSpace: "pre-wrap",
					// outline: "none",
					// overflowWrap: "break-word",

					...style,
				},

				// contentEditable: !state.readOnly,
				// suppressContentEditableWarning: !state.readOnly,

				"data-feature-read-only": state.readOnly || null,
			},
		)
	)
})

// export default Editor
