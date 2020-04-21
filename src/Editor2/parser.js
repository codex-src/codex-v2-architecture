import * as emojiTrie from "emoji-trie"
import newHashEpoch from "./newHashEpoch"
import typeEnum from "./typeEnum"
import { toInnerText } from "./cmap"

import {
	// HTTP,
	// HTTPS,
	ASCIIPunctuationPattern,
	ASCIIWhitespacePattern,
	isASCIIPunctuation,
	isASCIIWhitespace,
	// safeURLRe,
} from "./spec"

// function parseCode(str, x) {
// 	const syntax = "`"
// 	const phrase = `${syntax}x${syntax}`
//
// 	if (!(x < str.length && str.slice(x, x + syntax.length) === syntax && str.length - x >= phrase.length)) {
// 		return null
// 	}
// 	const offset = str.slice(x + syntax.length).search(`\\${syntax}`)
// 	if (offset <= 0) {
// 		return null
// 	}
// 	x += syntax.length
// 	const parsed = {
// 		type: typeEnum.Code,
// 		syntax,
// 		children: str.slice(x, x + offset),
// 	}
// 	x += offset + syntax.length
// 	return { parsed, x }
// }

// Parses a GitHub Flavored Markdown (GFM) type.
//
// NOTE: Does not match start syntax
function parseGFMType({
	type,   // The parsed enum type
	syntax, // The syntax (end syntax) // TODO: Rename to endSyntax?
	str,    // Argument string
	x,  // Arugment x (number)
}) {
	const shouldRecurse = type !== typeEnum.Code

	// Prepare an escaped search regex:
	let pattern = syntax.split("").map(each => `\\${each}`).join("")
	let patternOffset = 0
	switch (syntax[0]) {
	case "_":
		// Underscores cannot be escaped and must be proceeded
		// by a space or an ASCII punctuation character:
		if (x - 1 >= 0 && !(isASCIIWhitespace(str[x - 1]) || isASCIIPunctuation(str[x - 1]))) {
			return null
		}
		pattern = `[^\\\\]${pattern}(${ASCIIWhitespacePattern}|${ASCIIPunctuationPattern}|$)`
		patternOffset++
		break
	case "`":
		// No-op
		break
	default:
		// Etc. cannot be escaped:
		pattern = `[^\\\\]${pattern}`
		patternOffset++
		break
	}
	// Match cannot be empty:
	const offset = str.slice(x + syntax.length).search(pattern) + patternOffset
	if (offset <= 0) { // TODO: Compare typeEnum for ![]() syntax?
		return null
	// Match cannot be preceded or proceeded by a space (sans code):
	} else if (syntax[0] !== "`" && (isASCIIWhitespace(str[x + syntax.length]) || isASCIIWhitespace(str[x + syntax.length + offset - 1]))) {
		return null
	// Match cannot be redundant (e.g. ___, ***, and ~~~):
	} else if (str[x + syntax.length] === syntax[0]) {
		return null
	}
	// Increment start syntax:
	x += syntax.length
	const parsed = {
		type,
		syntax,
		children: !shouldRecurse ? str.slice(x, x + offset) : parseInlineElements(str.slice(x, x + offset)),
	}
	// Increment offset and end syntax:
	x += offset + syntax.length
	return { parsed, x2: x }
}

// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) { // TODO: Extract to parseInlineElements.js?
	if (!str) {
		return null
	}
	const parsed = []
	for (let x = 0; x < str.length; x++) {
		// Fast path:
		if (!isASCIIPunctuation(str[x]) && str[x] <= "\u00ff") { // Use "\u00ff" to guard BMP range, etc.
			if (!parsed.length || typeof parsed[parsed.length - 1] !== "string") {
				parsed.push(str[x])
				continue
			}
			parsed[parsed.length - 1] += str[x]
			continue
		}
		// Allocate convenience variables:
		const char = str[x]
		const nchars = str.length - x
		switch (true) {
		// <Escape>
		case char === "\\":
	 		if (x + 1 < str.length && isASCIIPunctuation(str[x + 1])) {
				parsed.push({
					type: typeEnum.Escape,
					syntax: [char],
					children: str[x + 1],
				})
				// Increment to the next character; the punctuation
				// character is auto-incremented:
				x++
				continue
			}
			// No-op
			break
		// <StrongEm> OR <Strong> OR <Em>
		case char === "*" || char === "_":
			// ***Strong emphasis*** OR ___Strong emphasis___
			if (nchars >= "***x***".length && str.slice(x, x + 3) === char.repeat(3)) {
				const res = parseGFMType({
					type: typeEnum.StrongEmphasis,
					syntax: char.repeat(3),
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
			// **Strong** OR __Strong__
			} else if (nchars >= "**x**".length && str.slice(x, x + 2) === char.repeat(2)) {
				const res = parseGFMType({
					type: typeEnum.Strong,
					syntax: char.repeat(2),
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
			// _Emphasis_ OR *Emphasis*
			} else if (nchars >= "*x*".length) {
				const res = parseGFMType({
					type: typeEnum.Emphasis,
					syntax: char,
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
		case char === "~":
			// ~~Strikethrough~~
			if (nchars >= "~~x~~".length && str.slice(x, x + 2) === "~~") {
				const res = parseGFMType({
					type: typeEnum.Strikethrough,
					syntax: char.repeat(2),
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
			// ~Strikethrough~
			} else if (nchars >= "~x~".length) {
				const res = parseGFMType({
					type: typeEnum.Strikethrough,
					syntax: char,
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
		case char === "`":
			if (nchars >= `x`.length) {
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

			// // <A> (1 of 2)
			// case char === "h":
			// 	// https://
			// 	//
			// 	// TODO: Eat "www."
			// 	if (nchars >= HTTPS.length && str.slice(x, x + HTTPS.length) === HTTPS) {
			// 		const matches = safeURLRe.exec(str.slice(x))
			// 		let offset = 0
			// 		if (matches) {
			// 			offset = matches[0].length
			// 		}
			// 		data.push({
			// 			type: A,
			// 			syntax: [HTTPS],
			// 			href: matches[0],
			// 			children: matches[0].slice(HTTPS.length),
			// 		})
			// 		x += offset - 1
			// 		continue
			// 	// http://
			// 	//
			// 	// TODO: Eat "www."
			// 	} else if (nchars >= HTTP.length && str.slice(x, x + HTTP.length) === HTTP) {
			// 		const matches = safeURLRe.exec(str.slice(x))
			// 		let offset = 0
			// 		if (matches) {
			// 			offset = matches[0].length
			// 		}
			// 		data.push({
			// 			type: A,
			// 			syntax: [HTTP],
			// 			href: matches[0],
			// 			children: matches[0].slice(HTTP.length),
			// 		})
			// 		x += offset - 1
			// 		continue
			// 	}
			// 	// No-op
			// 	break
			// // <A> (2 of 2)
			// case char === "[":
			// 	// [A](href)
			// 	if (nchars >= "[x](x)".length) {
			// 		const lhs = registerType(null, "]")(str, x)
			// 		if (!lhs) {
			// 			// No-op
			// 			break
			// 		}
			// 		// Check ( syntax:
			// 		if (lhs.x2 < str.length && str[lhs.x2] !== "(") {
			// 			// No-op
			// 			break
			// 		}
			// 		const rhs = registerType(null, ")", { recurse: false })(str, lhs.x2)
			// 		if (!rhs) {
			// 			// No-op
			// 			break
			// 		}
			// 		data.push({
			// 			type: A,
			// 			// syntax: ["[", "](…)"],
			// 			syntax: ["[", `](${rhs.data.children})`],
			// 			href: rhs.data.children.trim(),
			// 			children: lhs.data.children,
			// 		})
			// 		x = rhs.x2 - 1
			// 		continue
			// 	}
			// 	// No-op
			// 	break

		default:
			// <Emoji>
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
			parsed.push(char)
			continue
		}
		parsed[parsed.length - 1] += char
		// continue
	}
	if (parsed.length === 1 && typeof parsed[0] === "string") {
		return parsed[0]
	}
	return parsed
}

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
function parseElements(nodes) {
	const newHash = newHashEpoch()

	const parsed = []
	for (let x = 0; x < nodes.length; x++) {
		// Fast path:
		if (nodes[x].data.length && !isASCIIPunctuation(nodes[x].data[0])) {
			const children = parseInlineElements(nodes[x].data)
			parsed.push({
				type: typeEnum.Paragraph,
				id: nodes[x].id,
				// The number of emojis:
				emojis: (
					children &&
					children.reduce &&
					children.reduce((count, each) => count + (each && each.type && each.type === typeEnum.Emoji), 0)
				),
				children,
			})
			continue
		}
		// Allocate convenience variables:
		const each = nodes[x]
		const char = each.data.charAt(0)
		const nchars = each.data.length
		switch (true) {
		// <Header>
		case char === "#":
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
				parsed.push({
					type: typeEnum.Header,
					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
					id: each.id,
					syntax: [syntax],
					// TODO: Add text?
					hash: newHash(toInnerText(parseInlineElements(each.data.slice(syntax.length)))),
					children: parseInlineElements(each.data.slice(syntax.length)),
				})
				continue
			}
			// No-op
			break
		// <Blockquote>
		case char === ">":
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
		// <CodeBlock>
		case char === "`":
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
					type: typeEnum.CodeBlock,
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
		// <Break>
		case char === "-" || char === "*":
			// --- OR ***
			if (nchars === 3 && each.data === char.repeat(3)) {
				parsed.push({
					type: typeEnum.Break,
					id: each.id,
					syntax: [char.repeat(3)],
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
			// The number of emojis:
			emojis: (
				children &&
				children.reduce &&
				children.reduce((count, each) => count + (each && each.type && each.type === typeEnum.Emoji), 0)
			),
			children,
		})
		// continue
	}
	return parsed
}

// // Parses GFM str to a VDOM representation.
// export function parseGFM(str) {
// 	const newHash = newHashEpoch()
//
// 	const data = []
// 	const body = str.split("\n")
// 	for (let x = 0; x < body.length; x++) {
// 		const each = body[x]
// 		const char = each.charAt(0)
// 		const nchars = each.length
// 		switch (true) {
// 		// <Header>
// 		case char === "#":
// 			// # Header
// 			// ## Subheader
// 			// ### H3
// 			// #### H4
// 			// ##### H5
// 			// ###### H6
// 			if (
// 				(nchars >= 2 && each.slice(0, 2) === "# ") ||
// 				(nchars >= 3 && each.slice(0, 3) === "## ") ||
// 				(nchars >= 4 && each.slice(0, 4) === "### ") ||
// 				(nchars >= 5 && each.slice(0, 5) === "#### ") ||
// 				(nchars >= 6 && each.slice(0, 6) === "##### ") ||
// 				(nchars >= 7 && each.slice(0, 7) === "###### ")
// 			) {
// 				const syntax = each.slice(0, each.indexOf(" ") + 1)
// 				data.push({
// 					type: Header,
// 					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
// 					id: uuidv4(),
// 					syntax: [syntax],
// 					hash: newHash(toInnerString(parseInlineElements(each.slice(syntax.length)))),
// 					children: parseInlineElements(each.slice(syntax.length)),
// 				})
// 				continue
// 			}
// 			break
// 		// <Blockquote>
// 		case char === ">":
// 			// > Blockquote
// 			if (
// 				(nchars >= 2 && each.slice(0, 2) === "> ") ||
// 				(nchars === 1 && each === ">")
// 			) {
// 				const x1 = x
// 				let x2 = x1
// 				x2++
// 				// Iterate to end syntax:
// 				while (x2 < body.length) {
// 					if (
// 						(body[x2].length < 2 || body[x2].slice(0, 2) !== "> ") &&
// 						(body[x2].length !== 1 || body[x2] !== ">")
// 					) {
// 						// No-op
// 						break
// 					}
// 					x2++
// 				}
// 				data.push({
// 					type: Blockquote,
// 					id: uuidv4(),
// 					children: body.slice(x1, x2).map(each => ({
// 						type: BquoteParagraph,
// 						id: uuidv4(),
// 						syntax: [each.slice(0, 2)],
// 						children: parseInlineElements(each.slice(2)),
// 					})),
// 				})
// 				x = x2 - 1
// 				continue
// 			}
// 			break
// 		// <CodeBlock>
// 		case char === "`":
// 			// ```
// 			// Code block
// 			// ```
// 			if (
// 				nchars >= 3 &&
// 				each.slice(0, 3) === "```" &&
// 				each.slice(3).indexOf("`") === -1 && // Negate backticks
// 				x + 1 < body.length
// 			) {
// 				const x1 = x
// 				let x2 = x1
// 				x2++
// 				// Iterate to end syntax:
// 				while (x2 < body.length) {
// 					if (body[x2].length === 3 && body[x2] === "```") {
// 						// No-op
// 						break
// 					}
// 					x2++
// 				}
// 				if (x2 === body.length) { // Unterminated
// 					x = x1
// 					break
// 				}
// 				x2++ // Iterate once past end
// 				const info = each.slice(3)
// 				data.push({
// 					type: CodeBlock,
// 					id: uuidv4(),
// 					syntax: [body[x1], body[x2 - 1]],
// 					info,
// 					extension: info.split(".").slice(-1)[0].toLowerCase(),
// 					children: x1 + 1 === x2 - 1
// 						? ""
// 						: `${body.slice(x1 + 1, x2 - 1).join("\n")}\n`,
// 					// .slice(each.length, -3) // Trim syntax
// 					// .slice(1),              // Trim start paragraph
// 				})
// 				x = x2 - 1
// 				continue
// 			}
// 			break
// 		// <List>
// 		case char === "\t" || (
// 			(char === "-" || char === "+" || char === "*" || (char >= "0" && char <= "9")) &&
// 			(each !== "---" && each !== "***") // Negate break
// 		):
// 			// - List
// 			// 1. List
// 			if (nchars >= "- ".length && AnyListRe.test(each)) {
// 				const x1 = x
// 				let x2 = x1
// 				x2++
// 				// Iterate to end syntax:
// 				while (x2 < body.length) {
// 					if (body[x2].length < 2 || !AnyListRe.test(body[x2])) {
// 						// No-op
// 						break
// 					}
// 					x2++
// 				}
// 				const range = body.slice(x1, x2)
// 				data.push(parseList(range))
// 				x = x2 - 1
// 				continue
// 			}
// 			break
// 		// <Image>
// 		//
// 		// TODO: Move to parseInlineElements to support
// 		// [![Image](href)](href) syntax?
// 		case char === "!":
// 			// ![Image](href)
// 			if (nchars >= "![](x)".length) {
// 				const lhs = registerType(null, "]")(each, "!".length, { minOffset: 0 })
// 				if (!lhs) {
// 					// No-op
// 					break
// 				}
// 				// Check ( syntax:
// 				if (lhs.x2 < nchars && each[lhs.x2] !== "(") {
// 					// No-op
// 					break
// 				}
// 				const rhs = registerType(null, ")", { recurse: false })(each, lhs.x2)
// 				if (!rhs) {
// 					// No-op
// 					break
// 				}
// 				data.push({
// 					type: Image,
// 					id: uuidv4(),
// 					// syntax: ["![", "](…)"],
// 					syntax: ["![", `](${rhs.data.children})`],
// 					src: rhs.data.children,
// 					alt: toInnerString(lhs.data.children),
// 					children: lhs.data.children,
// 				})
// 				continue
// 			}
// 			break
// 		// <Break>
// 		case char === "-" || char === "*":
// 			// ---
// 			// ***
// 			if (nchars === 3 && each === char.repeat(3)) {
// 				data.push({
// 					type: Break,
// 					id: uuidv4(),
// 					syntax: [each],
// 					children: null,
// 				})
// 				continue
// 			}
// 			break
// 		default:
// 			// No-op
// 			break
// 		}
// 		// <Paragraph>
// 		const children = parseInlineElements(each)
// 		data.push({
// 			type: Paragraph,
// 			id: uuidv4(),
// 			emojis: (
// 				children &&
// 				children.every &&
// 				children.every(each => each.type === E)
// 			),
// 			children,
// 		})
// 	}
// 	return data
// }

export default parseElements
