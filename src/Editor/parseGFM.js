import * as emojiTrie from "emoji-trie"
import uuidv4 from "uuid/v4"
import { toInnerString } from "./cmap"

import {
	Blockquote,
	BquoteParagraph,
	Break,
	CodeBlock,
	Header,
	Image,
	List,
	ListItem,
	Paragraph,
	TaskItem,
} from "./Components"

import {
	A,
	Code,
	E,
	Em,
	Escape,
	Strike,
	Strong,
	StrongAndEm,
} from "./ComponentsText"

import {
	HTTP,
	HTTPS,
	isASCIIPunctuation,
	isASCIIWhitespace,
	safeURLRe,
} from "./spec"

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
			// ***Strong em***
			if (nchars >= "***x***".length && text.slice(index, index + 3) === char.repeat(3)) {
				const parsed = registerType(StrongAndEm, char.repeat(3))(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// **Strong**
			// __strong__
			} else if (nchars >= "**x**".length && text.slice(index, index + 2) === char.repeat(2)) {
				const parsed = registerType(Strong, char.repeat(2))(text, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// _Emphasis_
			// *emphasis*
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
			// <E>
			//
			// eslint-disable-next-line no-case-declarations
			const e = emojiTrie.atStart(text.slice(index))
			if (e && e.status === "fully-qualified") {
				data.push({
					type: E,
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
						type: BquoteParagraph,
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
						: `${body.slice(x1 + 1, x2 - 1).join("\n")}\n`,
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
				children.every(each => each.type === E)
			),
			children,
		})
	}
	return data
}

export default parseGFM
