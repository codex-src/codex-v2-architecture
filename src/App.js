import * as emojiTrie from "emoji-trie"
import * as spec from "./spec"
import DocumentTitle from "./DocumentTitle"
import escape from "lodash/escape"
import Prism from "./Prism"
import raw from "raw.macro"
import React from "react"
import ReactDOM from "react-dom"
import RenderModes from "./RenderModes"
import Settings from "./Settings"
import uuidv4 from "uuid/v4"

import {
	CompoundNode,
	Node,
} from "./HOC"

import "./App.css"

// Extraneous attributes.
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
	const [state] = React.useContext(EditorContext)
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

const Emoji = ({ description, ...props }) => (
	<span className="emoji" aria-label={description} role="img">
		<Markdown>
			{props.children}
		</Markdown>
	</span>
)

const Escape = ({ syntax, ...props }) => (
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

const Code = ({ syntax, ...props }) => (
	<span className="py-px font-mono text-sm text-red-600 bg-red-100 rounded" {...attrs.code}>
		<Markdown className="text-red-600" syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const Strike = ({ syntax, ...props }) => (
	<span {...attrs.strike}>
		<Markdown syntax={syntax}>
			{props.children}
		</Markdown>
	</span>
)

const A = ({ syntax, href, ...props }) => (
	<a className="underline text-md-blue-a400" href={href} {...attrs.a}>
		<Markdown syntax={!props.children || syntax}>
			{props.children || syntax}
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
	const [state] = React.useContext(EditorContext)

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
	const [state] = React.useContext(EditorContext)

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

const CodeBlockStandalone = ({ lang, data, ...props }) => {
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
		<div className="px-6 py-4 bg-white rounded-lg shadow-hero-lg" {...props}>
			<div className="whitespace-pre-wrap break-words font-mono text-sm leading-snug">
				{html || (
					data
				)}
			</div>
		</div>
	)
}

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
		marginLeft: "calc(((14 + 2) - 11.438) / 16 * -1em)",
		marginTop: "0.1875em",
		// width: "0.875em",
		// height: "0.875em",
	}
	return (
		<Node tag="li" className="checked -ml-5 my-1 flex flex-row" style={$checked && attrs.strike.style}>
			<Markdown className="hidden" syntax={syntax}>
				{/* NOTE: Use md-blue-a200 because md-blue-a400 is
				too dark and overwritten by attrs.strike.style */}
				<Checkbox className="mr-2 flex-shrink-0 w-4 h-4 text-md-blue-a200 shadow transition duration-150" style={checkboxStyle} {...$attrs} />
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
	const [state] = React.useContext(EditorContext)

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
	const [state] = React.useContext(EditorContext)
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
// TODO: Refactor to parseInner({ type, syntax, text, index, recurse, minOffset })?
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
	const parse = (text, index, { minOffset } = { minOffset: 1 }) => {
		// Guard: Character before start underscore syntax must
		// be whitespace or punctutation:
		//
		// https://github.github.com/gfm/#example-369
		if (syntax[0] === "_" && index - 1 >= 0 && (!spec.isASCIIWhitespace(text[index - 1]) && !spec.isASCIIPunctuation(text[index - 1]))) {
			return null
		}
		// Guard: Most syntax cannot surround spaces:
		const offset = text.slice(index + syntax.length).search(pattern) + patternOffset
		if (
			offset < minOffset ||
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && spec.isASCIIWhitespace(text[index + syntax.length])) ||           // Exempt <Code> and <A>
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && spec.isASCIIWhitespace(text[index + syntax.length + offset - 1])) // Exempt <Code> and <A>
		) {
			return null
		}
		index += syntax.length
		const data = {
			type,
			syntax,
			children: !recurse
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
	 		if (index + 1 < text.length && spec.isASCIIPunctuation(text[index + 1])) {
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
			if (nchars >= spec.HTTPS.length && text.slice(index, index + spec.HTTPS.length) === spec.HTTPS) {
				const matches = spec.safeURLRe.exec(text.slice(index))
				let offset = 0
				if (matches) {
					offset = matches[0].length
				}
				data.push({
					type: A,
					syntax: [spec.HTTPS],
					href: matches[0],
					children: matches[0].slice(spec.HTTPS.length),
				})
				index += offset - 1
				continue
			// http://
			//
			// TODO: Eat "www."
			} else if (nchars >= spec.HTTP.length && text.slice(index, index + spec.HTTP.length) === spec.HTTP) {
				const matches = spec.safeURLRe.exec(text.slice(index))
				let offset = 0
				if (matches) {
					offset = matches[0].length
				}
				data.push({
					type: A,
					syntax: [spec.HTTP],
					href: matches[0],
					children: matches[0].slice(spec.HTTP.length),
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
			const em = emojiTrie.atStart(text.slice(index))
			if (em && em.status === "fully-qualified") {
				data.push({
					type: Emoji,
					description: em.description,
					children: em.emoji,
				})
				index += em.emoji.length - 1
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
function parseGFM(text) {
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
		const [s1, s2] = getSyntax(each.syntax)
		if (options.markdown) {
			text += readSyntax(s1, each)
		}
		text += toInnerText(each.children, options)
		if (options.markdown) {
			text += readSyntax(s2, each)
		}
	}
	return text
}

// Parses a VDOM representation to text.
function toText(data, options = { markdown: false }) {
	let text = ""
	for (const each of data) {
		const [s1, s2] = getSyntax(each.syntax)
		text += !options.markdown ? "" : readSyntax(s1, each)
		if (each.type === Break) {
			// No-op
		} else if (each.type === Blockquote || each.type === List) {
			text += toText(each.children, options)
		} else {
			text += toInnerText(each.children, options)
		}
		text += !options.markdown ? "" : readSyntax(s2, each)
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
		html += readSyntax(s1, each)
		html += toInnerHTML(each.children)
		html += readSyntax(s2, each)
	}
	return html
}

// Parses a VDOM representation to an HTML string.
function toHTML(data) {
	let html = ""
	for (const each of data) {
		const [s1, s2] = cmapHTML[each.type.type || each.type]
		html += readSyntax(s1, each)
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
		html += readSyntax(s2, each)
		if (each !== data[data.length - 1]) {
			html += "\n"
		}
	}
	return html
}

// // Parses a VDOM representation to a JSON string.
// function toJSON(data) {
// 	const json = JSON.stringify(
// 		data,
// 		(key, value) => {
// 			// Non-React component:
// 			if (key !== "type") {
// 				return value
// 			}
// 			// React component (guard React.memo):
// 			return cmapJSON[value.type || value]
// 		},
// 		"\t",
// 	)
// 	return json
// }

const EditorContext = React.createContext()

// Maps type references to names or HTML.
const cmapJSON = new Map()
const cmapHTML = new Map()

// TODO: Add support for frameworks, e.g.
//
// - Alpine.js
// - Vue.js
// - React.js
// - Angular.js
// - etc.
//
;(() => {
	/* eslint-disable no-multi-spaces */
	cmapJSON[Emoji]           = "Emoji"
	cmapJSON[Escape]          = "Escape"
	cmapJSON[Em]              = "Em"
	cmapJSON[Strong]          = "Strong"
	cmapJSON[StrongAndEm]     = "StrongAndEm"
	cmapJSON[Code]            = "Code"
	cmapJSON[Strike]          = "Strike"
	cmapJSON[A]               = "A"
	cmapJSON[Header.type]     = "Header"
	cmapJSON[Paragraph.type]  = "Paragraph"
	cmapJSON[Blockquote.type] = "Blockquote"
	cmapJSON[CodeBlock.type]  = "CodeBlock"
	cmapJSON[ListItem.type]   = "ListItem"
	cmapJSON[TaskItem.type]   = "TaskItem"
	cmapJSON[List.type]       = "List"
	cmapJSON[Image.type]      = "Image"
	cmapJSON[Break.type]      = "Break"

	cmapHTML[Escape]          = ["", ""]
	cmapHTML[Emoji]           = [data => `<span aria-label="${data.description}" role="img">`, "</span>"]
	cmapHTML[Em]              = ["<em>", "</em>"]
	cmapHTML[Strong]          = ["<strong>", "</strong>"]
	cmapHTML[StrongAndEm]     = ["<strong><em>", "</em></strong>"]
	cmapHTML[Code]            = ["<code>", "</code>"]
	cmapHTML[Strike]          = ["<strike>", "</strike>"]
	cmapHTML[A]               = [data => `<a href="${data.href}">`, "</a>"]
	cmapHTML[Header.type]     = [data => `<a href="#${data.hash}">\n\t<h1 id="${data.hash}">\n\t\t`, "\n\t</h1>\n</a>"]
	cmapHTML[Paragraph.type]  = ["<p>\n\t", "\n</p>"]
	cmapHTML[Blockquote.type] = ["<blockquote>", "</blockquote>"]
	cmapHTML[CodeBlock.type]  = [data => `<pre${!data.lang ? "" : ` class="language-${(data.lang).toLowerCase()}"`}><code>`, "</code></pre>"]
	cmapHTML[ListItem.type]   = ["<li>\n\t", "\n</li>"]
	cmapHTML[TaskItem.type]   = [data => `<li>\n\t<input type="checkbox"${!data.checked || !data.checked.value ? "" : " checked"}>\n\t`, "\n</li>"]
	cmapHTML[List.type]       = [data => `<${data.tag}>`, data => `</${data.tag}>`]
	cmapHTML[Image.type]      = [data => `<img src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`, ""]
	cmapHTML[Break.type]      = ["<hr>", ""]
	/* eslint-enable no-multi-spaces */
})()

const Editor = React.forwardRef(({ className, style, state, setState, ...props }, ref) => {

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
					// tab-size:
					MozTabSize: 4,
					tabSize: 4,

					// contenteditable:
					caretColor: "black",

					// Imperative styles for contenteditable:
					whiteSpace: "pre-wrap",
					outline: "none",
					overflowWrap: "break-word",

					...style,
				},

				// contentEditable: !state.readOnly,
				// suppressContentEditableWarning: !state.readOnly,

				"data-feature-read-only": state.readOnly || null,
			},
		)
	)
})

// Parses a VDOM representation to other data types.
function parseTypes(data) {
	const types = {
		text: toText(data),
		html: toHTML(data),
		// json: toJSON(data),
	}
	return types
}

const RunesPerWord = 6
const WordsPerMinute = 250

// Parses a text representation to metadata.
function parseMetadata(text) {
	const runes = [...text].length
	const meta = {
		title: text.split("\n", 1),
		runes,
		words: text.split(/\s+/).filter(Boolean).length,
		seconds: Math.ceil(runes / RunesPerWord / WordsPerMinute * 60),
	}
	return meta
}

const KEY = "codex-app-v2.2"

const initialValue = (() => {
	const cache = localStorage.getItem(KEY)
	if (!cache) {
		return raw("./Demo.md")
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return raw("./Demo.md")
	}
	return json.data
})()

const App = props => {
	const textareaRef = React.useRef()
	const editorRef = React.useRef()

	// <textarea (1 of 2):
	const [value, setValue] = React.useState(() => initialValue)

	// Create state:
	const [state, setState] = React.useState(() => ({
		rect: { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 },
		renderMode: RenderModes.GFM,
		debugCSS: false,
		readOnly: false,
		raw: value,
		data: parseGFM(value),
		types: { text: "", html: "" /* , json: "" */ },
		metadata: { title: "", runes: 0, words: 0, seconds: 0 },
	}))

	// Update state:
	React.useEffect(() => {
		textareaRef.current.style.height = `${textareaRef.current.style.scrollHeight}px`

		let rect = null
		if (editorRef.current) {
			rect = editorRef.current.getBoundingClientRect()
		}
		const id = setTimeout(() => {
			const data = parseGFM(value)
			const types = parseTypes(data)
			setState(current => ({
				...current,
				rect,
				raw: value,
				data,
				types,
				metadata: parseMetadata(types.text),
			}))
			// Save to localStorage:
			localStorage.setItem(KEY, JSON.stringify({ data: value }))
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [value, state.renderMode])

	// Debug CSS:
	const mounted = React.useRef()
	React.useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		editorRef.current.classList.toggle("debug-css")
	}, [state.debugCSS])

	// Bind command-p for read-only:
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

	// Bind tab:
	const tabHandler = e => {
		if (e.keyCode !== 9) {
			// No-op
			return
		}
		e.preventDefault()
		const textarea = textareaRef.current
		const { value, selectionStart: pos1, selectionEnd: pos2 } = textarea
		// eslint-disable-next-line prefer-template
		const newValue = value.slice(0, pos1) + "\t" + value.slice(pos2)
		Object.assign(textarea, {
			value: newValue,
			selectionStart: pos1 + "\t".length,
			selectionEnd: pos2 + "\t".length,
		})
		setValue(newValue)
	}

	const cardStyle = { margin: "-0.5em 0", MozTabSize: 2, tabSize: 2 }
	return (
		<div className="flex flex-row justify-center">
			<div className="px-6 py-32 grid grid-cols-2 gap-12 w-full">

				{/* Settings */}
				<div className="p-3 fixed right-0 top-0 z-30">
					<Settings
						state={state}
						setState={setState}
					/>
				</div>

				{/* LHS */}
				<textarea
					ref={textareaRef}
					className="w-full h-full min-h-screen resize-none outline-none overflow-y-hidden"
					style={{ MozTabSize: 2, tabSize: 2 }}
					value={value}
					onKeyDown={tabHandler}
					onChange={e => setValue(e.target.value)}
				/>

				{/* RHS */}
				<DocumentTitle title={(state.metadata && state.metadata.title) || "Untitled"}>
					{state.renderMode === RenderModes.Text && (
						<CodeBlockStandalone
							style={cardStyle}
							lang={null} // No-op
							data={state.types.text}
						/>
					)}
					{state.renderMode === RenderModes.GFM && (
						<Editor
							ref={editorRef}
							style={{ fontSize: 17 }}
							state={state}
							setState={setState}
						/>
					)}
					{state.renderMode === RenderModes.HTML && (
						<CodeBlockStandalone
							style={cardStyle}
							lang="html"
							data={state.types.html}
						/>
					)}
					{/* {state.renderMode === RenderModes.JSON && (} */}
					{/* 	<CodeBlockStandalone} */}
					{/* 		style={cardStyle}} */}
					{/* 		lang="json"} */}
					{/* 		data={state.types.json}} */}
					{/* 	/>} */}
					{/* )}} */}
				</DocumentTitle>

			</div>
		</div>
	)
}

export default App
