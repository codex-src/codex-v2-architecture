import * as emojiTrie from "emoji-trie"
import newHashEpoch from "./newHashEpoch"
import typeEnum from "./typeEnum"
import { isAlphanum } from "encoding/ascii"
import { toInnerText } from "./cmap"

import {
	ASCIIPunctuationPattern,
	ASCIIWhitespacePattern,
	HTTP,
	HTTPS,
	isASCIIPunctuation,
	isASCIIWhitespace,
	safeURLRe,
} from "./spec"

// // Parses a GitHub Flavored Markdown (GFM) type.
// function parseGFMType({ type, syntax, str, x }) {
// 	const shouldRecurse = type !== typeEnum.Code
//
// 	// Prepare an escaped search regex:
// 	let pattern = syntax.split("").map(each => `\\${each}`).join("")
// 	let patternOffset = 0
// 	switch (syntax[0]) {
// 	// case "_":
// 	// 	// Underscores cannot be escaped and must be proceeded
// 	// 	// by a space or an ASCII punctuation character:
// 	// 	if (x - 1 >= 0 && !(isASCIIWhitespace(str[x - 1]) || isASCIIPunctuation(str[x - 1]))) {
// 	// 		return null
// 	// 	}
// 	// 	pattern = `[^\\\\]${pattern}(${ASCIIWhitespacePattern}|${ASCIIPunctuationPattern}|$)`
// 	// 	patternOffset++
// 	// 	break
// 	case "`":
// 		// No-op
// 		break
// 	default:
// 		// // Etc. cannot be escaped:
// 		// pattern = `[^\\\\]${pattern}`
// 		// patternOffset++
// 		// break
//
// 		// Underscores cannot be escaped and must be proceeded
// 		// by a space or an ASCII punctuation character:
// 		if (x - 1 >= 0 && !(isASCIIWhitespace(str[x - 1]) /* || isASCIIPunctuation(str[x - 1]) */)) {
// 			return null
// 		}
// 		pattern = `[^\\\\]${pattern}(${ASCIIWhitespacePattern}|${ASCIIPunctuationPattern}|$)`
// 		patternOffset++
// 		break
// 	}
// 	// Match cannot be empty:
// 	const offset = str.slice(x + syntax.length).search(pattern) + patternOffset
// 	if (offset <= 0) { // TODO: Compare typeEnum for ![]() syntax?
// 		return null
// 	// Match cannot be preceded or proceeded by a space (sans code):
// 	} else if (syntax[0] !== "`" && (isASCIIWhitespace(str[x + syntax.length]) || isASCIIWhitespace(str[x + syntax.length + offset - 1]))) {
// 		return null
// 	// Match cannot be redundant (e.g. ___, ***, and ~~~):
// 	} else if (str[x + syntax.length] === syntax[0]) {
// 		return null
// 	}
// 	// Increment start syntax:
// 	x += syntax.length
// 	const parsed = {
// 		type,
// 		syntax,
// 		children: !shouldRecurse ? str.slice(x, x + offset) : parseInlineElements(str.slice(x, x + offset)),
// 	}
// 	// Increment offset and end syntax:
// 	x += offset + syntax.length
// 	return { parsed, x2: x }
// }

// Parses a GitHub Flavored Markdown (GFM) type.
function parseGFMType({ type, syntax, str, x }) {
	// Syntax must be preceded by a BOL, space, or ASCII
	// punctuation character:
	if (x - 1 >= 0 && !isASCIIWhitespace(str[x - 1]) && !isASCIIPunctuation(str[x - 1])) { // E.g. ·*match*
		return null
	}
	// Prepare an escaped regex pattern:
	let pattern = syntax.split("").map(each => `\\${each}`).join("")
	let patternOffset = 0
	if (syntax[0] !== "`") { // Exempt code
		pattern = `[^\\\\]${pattern}`
		patternOffset++
	}
	// Syntax must be proceeded by a space, EOL, or ASCII
	// punctuation character:
	pattern += `(${ASCIIWhitespacePattern}|${ASCIIPunctuationPattern}|$)`
	// Match cannot be empty:
	const offset = str.slice(x + syntax.length).search(pattern) + patternOffset
	if (offset <= 0) { // TODO: Compare typeEnum for ![]() syntax?
		return null
	// Match cannot be surrounded by a space:
	} else if (
		isASCIIWhitespace(str[x + syntax.length]) ||           // E.g. *·match
		isASCIIWhitespace(str[x + syntax.length + offset - 1]) // E.g. match·*
	) {
		return null
	// Match start or end cannot be redundant:
	} else if (
		str[x + syntax.length] === syntax[0] ||                              // E.g. ****match
		str[x + syntax.length + offset - 1] === syntax[syntax.length - 1]) { // E.g. match****
		return null
	}
	// Increment start syntax (assumes start and end syntax
	// are the same):
	x += syntax.length
	const parsed = {
		type,
		syntax,
		children: type !== typeEnum.Code && (type !== typeEnum.Anchor && syntax !== ")")
			? parseInlineElements(str.slice(x, x + offset))
			: str.slice(x, x + offset),
	}
	// Increment offset and end syntax:
	x += offset + syntax.length
	return { parsed, x2: x }
}

// TODO (1): Memoize previously parsed elements
// TODO (2): https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) { // TODO: Extract to parseInlineElements.js?
	if (!str) {
		return null
	}
	const parsed = []
	for (let x = 0; x < str.length; x++) {
		// Fast pass:
		if (!isASCIIPunctuation(str[x]) && str[x] !== "h" && str[x] <= "\u00ff") { // TODO: Add "w" for "www"?
			if (!parsed.length || typeof parsed[parsed.length - 1] !== "string") {
				parsed.push(str[x])
				continue
			}
			parsed[parsed.length - 1] += str[x]
			continue
		}
		const nchars = str.length - x
		switch (str[x]) {
		// <Escape>
		case "\\":
	 		if (x + 1 < str.length && isASCIIPunctuation(str[x + 1])) {
				parsed.push({
					type: typeEnum.Escape,
					syntax: ["\\"],
					children: str[x + 1],
				})
				// Increment to the next character; the punctuation
				// character is auto-incremented:
				x++
				continue
			}
			// No-op
			break
		// <Emphasis>
		case "_":
			// _Emphasis_
			if (nchars >= "_x_".length) {
				const res = parseGFMType({
					type: typeEnum.Emphasis,
					syntax: "_",
					str,
					x,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				x = res.x2 - 1
				continue
			}
			// No-op
			break
		// <StrongEmphasis>
		// <Strong>
		// <Emphasis>
		case "*":
			// ***Strong emphasis***
			if (nchars >= "***x***".length && str.slice(x, x + 3) === "***") {
				const res = parseGFMType({
					type: typeEnum.StrongEmphasis,
					syntax: "***",
					str,
					x,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				x = res.x2 - 1
				continue
			// **Strong**
			} else if (nchars >= "**x**".length && str.slice(x, x + 2) === "**") {
				const res = parseGFMType({
					type: typeEnum.Strong,
					syntax: "**",
					str,
					x,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				x = res.x2 - 1
				continue
			// *Emphasis*
			} else if (nchars >= "*x*".length) {
				const res = parseGFMType({
					type: typeEnum.Emphasis,
					syntax: "*",
					str,
					x,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				x = res.x2 - 1
				continue
			}
			// No-op
			break
		// <Strikethrough>
		case "~":
			// ~~Strikethrough~~
			if (nchars >= "~~x~~".length && str.slice(x, x + 2) === "~~") {
				const res = parseGFMType({
					type: typeEnum.Strikethrough,
					syntax: "~~",
					str,
					x,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				x = res.x2 - 1
				continue
			}
			// No-op
			break
		// <Code>
		case "`":
			// `Code`
			if (nchars >= "x".length) {
				const res = parseGFMType({
					type: typeEnum.Code,
					syntax: "`",
					str,
					x,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				x = res.x2 - 1
				continue
			}
			// No-op
			break
			// <Anchor> (1 of 2)
		case "h":
			// https:// OR http://
			if (
				(nchars >= HTTPS.length && str.slice(x, x + HTTPS.length) === HTTPS) ||
				(nchars >= HTTP.length && str.slice(x, x + HTTP.length) === HTTP)
			) {
				let syntax = `${str.slice(x).split("://", 1)[0]}://`
				if (str.slice(x, x + syntax.length + 4) === `${syntax}www.`) {
					syntax += "www."
				}
				let [href] = safeURLRe.exec(str.slice(x))
				if (href.length === syntax.length) {
					// No-op; defer to end
				} else if (!(isAlphanum(href[href.length - 1]) || href[href.length - 1] === "/")) {
					href = href.slice(0, href.length - 1)
				}
				parsed.push({
					type: typeEnum.Anchor,
					syntax: [syntax],
					href,
					children: href.slice(syntax.length),
				})
				x += href.length - 1
				continue
			}
			// No-op
			break
		// <Anchor> (2 of 2)
		case "[":
			// [Anchor](href)
			if (nchars >= "[x](x)".length) {
				const lhs = parseGFMType({ type: typeEnum.Anchor, syntax: "]", str, x })
				if (!lhs) {
					// No-op
					break
				}
				// Check ( syntax:
				if (lhs.x2 < str.length && str[lhs.x2] !== "(") {
					// No-op
					break
				}
				// lhs.x2++
				const rhs = parseGFMType({ type: typeEnum.Anchor, syntax: ")", str, x: lhs.x2 })
				if (!rhs) {
					// No-op
					break
				}
				parsed.push({
					type: typeEnum.Anchor,
					// syntax: ["[", "](…)"],
					syntax: ["[", `](${rhs.parsed.children})`],
					href: rhs.parsed.children.trim(), // FIXME: Remove trim?
					children: lhs.parsed.children,
				})
				x = rhs.x2 - 1
				continue
			}
			// No-op
			break
		// <Emoji>
		default:
			// 😀
			const emojiInfo = emojiTrie.atStart(str.slice(x))
			if (emojiInfo && emojiInfo.status === "fully-qualified") { // TODO: Add "component"?
				parsed.push({
					type: typeEnum.Emoji,
					description: emojiInfo.description,
					children: emojiInfo.emoji,
				})
				x += emojiInfo.emoji.length - 1
				continue
			}
			// No-op
			break
		}
		if (!parsed.length || typeof parsed[parsed.length - 1] !== "string") {
			parsed.push(str[x])
			continue
		}
		parsed[parsed.length - 1] += str[x]
	}
	if (parsed.length === 1 && typeof parsed[0] === "string") {
		return parsed[0]
	}
	return parsed
}

// /* eslint-disable no-multi-spaces, no-useless-escape */
// const AnyListRe      = /^\t*(?:- \[( |x)\] |[\-\+\*] |\d+\. )/
// const NumberedListRe = /^\t*\d+\. /
// /* eslint-enable no-multi-spaces, no-useless-escape */
//
// // Parses a list-based VDOM representation from a range of
// // paragraphs.
// function parseList(range) {
// 	let tag = !NumberedListRe.test(range[0]) ? "ul" : "ol"
// 	const data = {
// 		type: List,
// 		tag,
// 		id: uuidv4(),
// 		children: [],
// 	}
// 	for (const each of range) {
// 		const [syntax] = each.match(AnyListRe)
// 		const substr = each.slice(syntax.length)
// 		let ref = data.children
// 		let deep = 0
// 		const depth = syntax.search(/[^\t]/)
// 		while (deep < depth) {
// 			if (!ref.length || ref[ref.length - 1].type !== List) {
// 				tag = !NumberedListRe.test(each) ? "ul" : "ol"
// 				ref.push({
// 					type: List,
// 					tag,
// 					id: uuidv4(),
// 					children: [],
// 				})
// 			}
// 			ref = ref[ref.length - 1].children
// 			deep++
// 		}
// 		let checked = null
// 		if (syntax.endsWith("- [ ] ") || syntax.endsWith("- [x] ")) {
// 			const value = syntax[syntax.length - 3] === "x"
// 			checked = { value }
// 		}
// 		ref.push({
// 			type: !checked ? ListItem : TodoItem,
// 			tag,
// 			id: uuidv4(),
// 			syntax: [syntax],
// 			checked,
// 			children: parseInnerGFM(substr),
// 		})
// 	}
// 	return data
// }

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
function parseElements(nodes) {
	const newHash = newHashEpoch()

	const parsed = []
	for (let x = 0; x < nodes.length; x++) {
		// Fast pass:
		if (!nodes[x].data.length || !isASCIIPunctuation(nodes[x].data[0])) { // TODO: Add "h" for "https://" and "http://"?
			const children = parseInlineElements(nodes[x].data)
			parsed.push({
				type: typeEnum.Paragraph,
				id: nodes[x].id,
				emojis: (
					children &&
					children.every &&
					children.every(each => each && each.type && each.type === typeEnum.Emoji) &&
					children.length
				),
				children,
			})
			continue
		}
		const each = nodes[x]
		const nchars = each.data.length
		switch (each.data[0]) { // Safe because of fast pass
		// <Header>
		case "#":
			// # H1 … ###### H6
			if (
				(nchars >= 2 && each.data.slice(0, 2) === "# ") ||
				(nchars >= 3 && each.data.slice(0, 3) === "## ") ||
				(nchars >= 4 && each.data.slice(0, 4) === "### ") ||
				(nchars >= 5 && each.data.slice(0, 5) === "#### ") ||
				(nchars >= 6 && each.data.slice(0, 6) === "##### ") ||
				(nchars >= 7 && each.data.slice(0, 7) === "###### ")
			) {
				const syntax = each.data.slice(0, each.data.indexOf(" ") + 1)
				// const text = toInnerText(parseInlineElements(each.data.slice(syntax.length)))
				parsed.push({
					type: typeEnum.Header,
					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
					id: each.id,
					syntax: [syntax],
					// text: text,
					hash: newHash(toInnerText(parseInlineElements(each.data.slice(syntax.length)))),
					children: parseInlineElements(each.data.slice(syntax.length)),
				})
				continue
			}
			// No-op
			break
		// <Blockquote>
		//
		// TODO: Add nested <Blockquote>
		case ">":
			// > Blockquote
			if (
				(nchars >= 2 && each.data.slice(0, 2) === "> ") ||
				(nchars === 1 && each.data === ">")
			) {
				const x1 = x
				let x2 = x1
				x2++
				// Iterate to end syntax:
				while (x2 < nodes.length) {
					if (
						(nodes[x2].data.length < 2 || nodes[x2].data.slice(0, 2) !== "> ") &&
						(nodes[x2].data.length !== 1 || nodes[x2].data !== ">")
					) {
						// No-op
						break
					}
					x2++
				}
				parsed.push({
					// <Blockquote>
					type: typeEnum.Blockquote,
					id: nodes[x1].id,
					children: nodes.slice(x1, x2).map((_, offset) => ({
						// <BlockquoteItem>
						type: typeEnum.BlockquoteItem,
						id: nodes[x + offset].id,
						syntax: [nodes[x + offset].data.slice(0, 2)],
						children: parseInlineElements(nodes[x + offset].data.slice(2)),
					})),
				})
				x = x2 - 1
				continue
			}
			// No-op
			break
		// <Preformatted>
		case "`":
			if (
				nchars >= 3 &&
				each.data.slice(0, 3) === "```" &&
				each.data.slice(3).indexOf("`") === -1 && // Negate backticks
				x + 1 < nodes.length
			) {
				const x1 = x
				let x2 = x1
				x2++
				// Iterate to end syntax:
				while (x2 < nodes.length) {
					if (nodes[x2].data.length === 3 && nodes[x2].data === "```") {
						// No-op
						break
					}
					x2++
				}
				if (x2 === nodes.length) { // Unterminated
					x = x1
					break
				}
				x2++ // Iterate once past end
				// const infoString = each.data.slice(3)
				parsed.push({
					type: typeEnum.Preformatted,
					id: nodes[x1].id,
					syntax: [nodes[x1].data, nodes[x2 - 1].data],
					extension: nodes[x1].data.slice(3).split(".").slice(-1)[0].toLowerCase(),
					children: nodes.slice(x1, x2),
				})
				x = x2 - 1
				continue
			}
			// No-op
			break

		// // <List>
		// case char === "\t" || (
		// 	(char === "-" || char === "+" || char === "*" || (char >= "0" && char <= "9")) &&
		// 	(each !== "---" && each !== "***") // Negate break
		// ):
		// 	// - List
		// 	// 1. List
		// 	if (nchars >= "- ".length && AnyListRe.test(each)) {
		// 		const x1 = index
		// 		let x2 = x1
		// 		x2++
		// 		// Iterate to end syntax:
		// 		while (x2 < body.length) {
		// 			if (body[x2].length < 2 || !AnyListRe.test(body[x2])) {
		// 				// No-op
		// 				break
		// 			}
		// 			x2++
		// 		}
		// 		const range = body.slice(x1, x2)
		// 		data.push(parseList(range))
		// 		index = x2 - 1
		// 		continue
		// 	}
		// 	break

		// <Break>
		case "-":
			// ***
			if (nchars === 3 && each.data === "---") {
				parsed.push({
					type: typeEnum.Break,
					id: each.id,
					syntax: ["---"],
					children: null,
				})
				continue
			}
			// No-op
			break
		// <Break> (alternate syntax)
		case "*":
			// ***
			if (nchars === 3 && each.data === "***") {
				parsed.push({
					type: typeEnum.Break,
					id: each.id,
					syntax: ["***"],
					children: null,
				})
				continue
			}
			// No-op
			break
		default:
			// No-op
			break
		}
		const children = parseInlineElements(each.data)
		parsed.push({
			type: typeEnum.Paragraph,
			id: each.id,
			emojis: (
				children &&
				children.every &&
				children.every(each => each && each.type && each.type === typeEnum.Emoji) &&
				children.length
			),
			children,
		})
	}
	return parsed
}

export default parseElements
