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
	h1: trimAny("font-medium   text-3xl leading-tight"),
	h2: trimAny("font-medium   text-2xl leading-tight"),
	h3: trimAny("font-semibold text-xl  leading-tight"),
	h4: trimAny("font-semibold text-xl  leading-tight"),
	h5: trimAny("font-semibold text-xl  leading-tight"),
	h6: trimAny("font-semibold text-xl  leading-tight"),
}

const Header = React.memo(({ tag, id, syntax, hash, data }) => (
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

// NOTE (1): Compound component
const Blockquote = React.memo(({ id, data }) => {
	const [state] = useEditorState()

	const compoundNodeStyle = state.readOnly && { boxShadow: "inset 0.125em 0 var(--gray-600)" }
	const eachStyle = state.readOnly && { paddingLeft: "calc((14.266 + 8) / 16 * 1em)" }
	return (
		<CompoundNode id={id} style={compoundNodeStyle}>
			{data.map((each, index) => (
				<Node key={each.id} id={each.id} className="text-gray-600" style={eachStyle}>
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
const CodeBlock = React.memo(({ id, syntax, info, extension, data }) => {
	const [state] = useEditorState()

	const [html, setHTML] = React.useState(null)

	React.useEffect(() => {
		if (!extension) {
			// No-op
			return
		}
		const parser = Prism[extension]
		if (!parser) {
			// No-op
			return
		}
		setHTML((
			<div className={extension && `language-${extension}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(data, parser, extension),
			}} />
		))
	}, [extension, data])

	return (
		<CompoundNode className="px-6 bg-gray-50 shadow-hero rounded" {...attrs.code}>
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
	<Node tag="li" className="-ml-5 my-2 flex flex-row">
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
		<Node tag="li" className="checked -ml-5 my-2 flex flex-row" style={$checked && attrs.strike.style}>
			<Markdown className="hidden" syntax={syntax}>
				{/* NOTE: Use md-blue-a200 because md-blue-a400 is
				too dark and overwritten by attrs.strike.style */}
				<Checkbox className={`flex-shrink-0 w-4 h-4 text-md-blue-a200 ${!$checked ? "shadow-hero" : "shadow"} transition duration-150`} style={checkboxStyle} {...$attrs} />
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
function registerType(type, syntax, opts = { recurse: true }) {
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
			children: !opts.recurse
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
				const parsed = registerType(Code, "```", { recurse: false })(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// `Code`
			} else if (nchars >= "`x`".length) {
				const parsed = registerType(Code, "`", { recurse: false })(text, index)
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
			// [A](href)
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
				const rhs = registerType(null, ")", { recurse: false })(text, lhs.x2)
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
	let tag = !NumberedListRe.test(range[0]) ? "ul" : "ol"
	const data = {
		type: List,
		tag,
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
				tag = !NumberedListRe.test(each) ? "ul" : "ol"
				ref.push({
					type: List,
					tag,
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
			tag,
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
					hash: newHash(toInnerString(parseInnerGFM(each.slice(syntax.length)))),
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
				const info = each.slice(3)
				data.push({
					type: CodeBlock,
					id: uuidv4(),
					syntax: [body[x1], body[x2 - 1]],
					info,
					extension: info.split(".").slice(-1)[0].toLowerCase(),
					children: x1 + 1 === x2 - 1
						? ""
						: body.slice(x1 + 1, x2 - 1).join("\n") + "\n"
						// .slice(each.length, -3) // Trim syntax
						// .slice(1),              // Trim start paragraph
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
				const rhs = registerType(null, ")", { recurse: false })(each, lhs.x2)
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
					alt: toInnerString(lhs.data.children),
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

// Component maps.
//
/* eslint-disable no-multi-spaces */
const cmapText      = new Map()
const cmapHTML      = new Map()
const cmapHTML__BEM = new Map()
const cmapReact_js  = new Map()
/* eslint-enable no-multi-spaces */

// TODO: Add selective escapes for React
//
// https://github.com/lodash/lodash/blob/3.0.0-npm-packages/lodash.escape/index.js
//
// '<': '&lt;',
// '>': '&gt;',

// Parses a nested VDOM representation to a string.
function toInnerString(children, cmap = cmapText) {
	let str = ""
	if (children === null || typeof children === "string") {
		if (cmap === cmapText) {
			return children || ""
		}
		return escape(children) || (cmap !== cmapReact_js ? "<br>" : "<br />")
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			str += toInnerString(each, cmap)
			continue
		}
		const fn = cmap[each.type.type || each.type]
		str += fn(each)
	}
	return str
}

// Parses a VDOM representation to a string.
function toString(data, cmap = cmapText) {
	let str = ""
	for (const each of data) {
		const fn = cmap[each.type.type || each.type]
		str += fn(each)
		if (each !== data[data.length - 1]) {
			str += "\n"
		}
	}
	return str
}

export function toText(data) {
	return toString(data, cmapText)
}
export function toHTML(data) {
	return toString(data, cmapHTML)
}
export function toHTML__BEM(data) {
	return toString(data, cmapHTML__BEM)
}
export function toReact_js(data) {
	return toString(data, cmapReact_js)
}

;(() => {
	/* eslint-disable no-multi-spaces */
	cmapText[Escape]               = data => data.children
	cmapText[Emoji]                = data => toInnerString(data.children)
	cmapText[Em]                   = data => toInnerString(data.children)
	cmapText[Strong]               = data => toInnerString(data.children)
	cmapText[StrongAndEm]          = data => toInnerString(data.children)
	cmapText[Code]                 = data => data.children
	cmapText[Strike]               = data => toInnerString(data.children)
	cmapText[A]                    = data => toInnerString(data.children)
	cmapText[Header.type]          = data => toInnerString(data.children)
	cmapText[Paragraph.type]       = data => toInnerString(data.children)
	cmapText[Blockquote.type]      = data => toString(data.children)
	cmapText[CodeBlock.type]       = data => data.children.slice(0, -1)
	cmapText[ListItem.type]        = data => toInnerString(data.children)
	cmapText[TaskItem.type]        = data => toInnerString(data.children)
	cmapText[List.type]            = data => toString(data.children)
	cmapText[Image.type]           = data => toInnerString(data.children)
	cmapText[Break.type]           = data => ""

	// TODO: Change <img ...> to <figure ...>
	cmapHTML[Escape]               = data => data.children
	cmapHTML[Emoji]                = data => `<span aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML)}</span>`
	cmapHTML[Em]                   = data => `<em>${toInnerString(data.children, cmapHTML)}</em>`
	cmapHTML[Strong]               = data => `<strong>${toInnerString(data.children, cmapHTML)}</strong>`
	cmapHTML[StrongAndEm]          = data => `<strong><em>${toInnerString(data.children, cmapHTML)}</em></strong>`
	cmapHTML[Code]                 = data => `<code>${toInnerString(data.children, cmapHTML)}</code>`
	cmapHTML[Strike]               = data => `<strike>${toInnerString(data.children, cmapHTML)}</strike>`
	cmapHTML[A]                    = data => `<a href="${data.href}">${toInnerString(data.children, cmapHTML)}</a>`
	cmapHTML[Header.type]          = data => `<a href="#${data.hash}">\n\t<h1 id="${data.hash}">\n\t\t${toInnerString(data.children, cmapHTML)}\n\t</h1>\n</a>`
	cmapHTML[Paragraph.type]       = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[Blockquote.type]      = data => `<blockquote>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	cmapHTML[CodeBlock.type]       = data => `<pre${!data.extension ? "" : ` class="language-${(data.extension).toLowerCase()}"`}><code><!--\n-->${toInnerString(data.children, cmapHTML).slice(0, -1)}<!--\n--></code></pre>`
	cmapHTML[ListItem.type]        = data => `<li>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	cmapHTML[TaskItem.type]        = data => `<li>\n\t<input type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	cmapHTML[List.type]            = data => `<${data.tag}>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	cmapHTML[Image.type]           = data => `<img src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`
	cmapHTML[Break.type]           = data => "<hr>"

	// TODO: Change <img ...> to <figure ...>
	// TODO: BEM for <blockquote>
	cmapHTML__BEM[Escape]          = data => data.children
	cmapHTML__BEM[Emoji]           = data => `<span class="emoji" aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML__BEM)}</span>`
	cmapHTML__BEM[Em]              = data => `<em class="em">${toInnerString(data.children, cmapHTML__BEM)}</em>`
	cmapHTML__BEM[Strong]          = data => `<strong class="strong">${toInnerString(data.children, cmapHTML__BEM)}</strong>`
	cmapHTML__BEM[StrongAndEm]     = data => `<strong class="strong"><em class="em">${toInnerString(data.children, cmapHTML__BEM)}</em></strong>`
	cmapHTML__BEM[Code]            = data => `<code class="code">${toInnerString(data.children, cmapHTML__BEM)}</code>`
	cmapHTML__BEM[Strike]          = data => `<strike class="strike">${toInnerString(data.children, cmapHTML__BEM)}</strike>`
	cmapHTML__BEM[A]               = data => `<a class="a" href="${data.href}" target="_blank">${toInnerString(data.children, cmapHTML__BEM)}</a>`
	cmapHTML__BEM[Header.type]     = data => `<a href="#${data.hash}">\n\t<${data.tag} id="${data.hash}" class="${data.tag}">\n\t\t${toInnerString(data.children, cmapHTML__BEM)}\n\t</${data.tag}>\n</a>`
	cmapHTML__BEM[Paragraph.type]  = data => `<p class="p${!data.emojis ? "" : ` emojis--${data.children.length}`}">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</p>`
	cmapHTML__BEM[Blockquote.type] = data => `<blockquote class="blockquote">${`\n${toString(data.children, cmapHTML__BEM).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	cmapHTML__BEM[CodeBlock.type]  = data => `<pre class="pre"${!data.extension ? "" : ` class="language-${(data.extension).toLowerCase()}"`}><code class="pre__code"><!--\n-->${toInnerString(data.children, cmapHTML__BEM).slice(0, -1)}<!--\n--></code></pre>`
	cmapHTML__BEM[ListItem.type]   = data => `<li class="${data.tag}__li">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</li>`
	cmapHTML__BEM[TaskItem.type]   = data => `<li class="${data.tag}__li">\n\t<input class="${data.tag}__li__input--${!data.checked.value ? "unchecked" : "checked"}" type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</li>`
	cmapHTML__BEM[List.type]       = data => `<${data.tag} class="${data.tag}">${`\n${toString(data.children, cmapHTML__BEM).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	cmapHTML__BEM[Image.type]      = data => `<img class="img" src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`
	cmapHTML__BEM[Break.type]      = data => "<hr class=\"hr\">"

	cmapReact_js[Escape]           = data => data.children
	cmapReact_js[Emoji]            = data => `<E>${toInnerString(data.children, cmapReact_js)}</E>`
	cmapReact_js[Em]               = data => `<Em>${toInnerString(data.children, cmapReact_js)}</Em>`
	cmapReact_js[Strong]           = data => `<Strong>${toInnerString(data.children, cmapReact_js)}</Strong>`
	cmapReact_js[StrongAndEm]      = data => `<StrongEm>${toInnerString(data.children, cmapReact_js)}</StrongEm>`
	cmapReact_js[Code]             = data => `<Code>${toInnerString(data.children, cmapReact_js)}</Code>`
	cmapReact_js[Strike]           = data => `<Strike>${toInnerString(data.children, cmapReact_js)}</Strike>`
	cmapReact_js[A]                = data => `<A href="${data.href}">${toInnerString(data.children, cmapReact_js)}</A>`
	cmapReact_js[Header.type]      = data => `<a href="#${data.hash}">\n\t<Header${data.tag === "h1" ? "" : ` ${data.tag}`} id="${data.hash}">\n\t\t${toInnerString(data.children, cmapReact_js)}\n\t</Header>\n</a>`
	cmapReact_js[Paragraph.type]   = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[Blockquote.type]  = data => `<Blockquote>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</Blockquote>`
	cmapReact_js[CodeBlock.type]   = data => `<Pre${!data.extension ? "" : ` info="${(data.extension).toLowerCase()}"`}>\n{\`${toInnerString(data.children.slice(0, -1)).replace(/`/g, "\\`")}\`}\n</Pre>`
	cmapReact_js[ListItem.type]    = data => `<Item>\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	cmapReact_js[TaskItem.type]    = data => `<Item>\n\t<Todo${!data.checked.value ? "" : " checked"} />\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	cmapReact_js[List.type]        = data => `<List${data.tag === "ul" ? "" : " ordered"}>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</List>`
	cmapReact_js[Image.type]       = data => `<Image src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`} />`
	cmapReact_js[Break.type]       = data => "<Break />"
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
