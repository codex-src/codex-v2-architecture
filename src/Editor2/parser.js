// import uuidv4 from "uuid/v4"
import typeEnum from "./typeEnum"

import {
	// HTTP,
	// HTTPS,
	ASCIIPunctuationPattern,
	ASCIIWhitespacePattern,
	isASCIIPunctuation,
	isASCIIWhitespace,
	// safeURLRe,
} from "./spec"

// function parseCode(str, index) {
// 	const syntax = "`"
// 	const phrase = `${syntax}x${syntax}`
//
// 	if (!(index < str.length && str.slice(index, index + syntax.length) === syntax && str.length - index >= phrase.length)) {
// 		return null
// 	}
// 	const offset = str.slice(index + syntax.length).search(`\\${syntax}`)
// 	if (offset <= 0) {
// 		return null
// 	}
// 	index += syntax.length
// 	const parsed = {
// 		type: typeEnum.Code,
// 		syntax,
// 		children: str.slice(index, index + offset),
// 	}
// 	index += offset + syntax.length
// 	return { parsed, index }
// }

// Parses a type.
//
// NOTE: Does not match start syntax
function parseType({
	type,   // The parsed enum type
	syntax, // The syntax (end syntax) // TODO: Rename to endSyntax?
	str,    // Argument string
	index,  // Arugment index (number)
}) {
	const shouldRecurse = type !== typeEnum.Code

	// Prepare an escaped search regex:
	let searchPattern = syntax.split("").map(each => `\\${each}`).join("")
	let searchPatternOffset = 0
	switch (syntax[0]) {
	case "_":
		// Underscores cannot be escaped and must be proceeded
		// by a space or an ASCII punctuation character:
		if (index - 1 >= 0 && !(isASCIIWhitespace(str[index - 1]) || isASCIIPunctuation(str[index - 1]))) {
			return null
		}
		searchPattern = `[^\\\\]${searchPattern}(${ASCIIWhitespacePattern}|${ASCIIPunctuationPattern}|$)`
		searchPatternOffset++
		break
	case "`":
		// No-op
		break
	default:
		// Etc. cannot be escaped:
		searchPattern = `[^\\\\]${searchPattern}`
		searchPatternOffset++
		break
	}
	// Match cannot be an empty string:
	const offset = str.slice(index + syntax.length).search(searchPattern) + searchPatternOffset
	if (offset <= 0) { // TODO: Compare typeEnum for ![]() syntax
		return null
	// Match cannot be preceded or proceeded by a space (code
	// exempt):
	} else if (syntax[0] !== "`" && (isASCIIWhitespace(str[index + syntax.length]) || isASCIIWhitespace(str[index + syntax.length + offset - 1]))) {
		return null
	}
	// Increment start syntax:
	index += syntax.length
	const parsed = {
		type,
		syntax,
		children: !shouldRecurse ? str.slice(index, index + offset) : parseInlineElements(str.slice(index, index + offset)),
	}
	// Increment offset and end syntax:
	index += offset + syntax.length
	return { parsed, x2: index }
}

// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) {
	if (!str) {
		return null
	}
	const parsed = []
	for (let index = 0; index < str.length; index++) {
		const char = str[index]
		const nchars = str.length - index
		switch (true) {

		// // <Escape>
		// case char === "\\":
	 	// 	if (index + 1 < str.length && isASCIIPunctuation(str[index + 1])) {
		// 		data.push({
		// 			type: Escape,
		// 			syntax: [char],
		// 			children: str[index + 1],
		// 		})
		// 		index++
		// 		continue
		// 	}
		// 	// No-op
		// 	break

		// <StrongEm> OR <Strong> OR <Em>
		case char === "*" || char === "_":
			// ***Strong emphasis*** OR ___Strong emphasis___
			if (nchars >= "***x***".length && str.slice(index, index + 3) === char.repeat(3)) {
				const res = parseType({
					type: typeEnum.StrongEmphasis,
					syntax: char.repeat(3),
					str,
					index,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				index = res.x2 - 1
				continue
			// **Strong** OR __Strong__
			} else if (nchars >= "**x**".length && str.slice(index, index + 2) === char.repeat(2)) {
				const res = parseType({
					type: typeEnum.Strong,
					syntax: char.repeat(2),
					str,
					index,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				index = res.x2 - 1
				continue
			// _Emphasis_ OR *Emphasis*
			} else if (nchars >= "*x*".length) {
				const res = parseType({
					type: typeEnum.Emphasis,
					syntax: char,
					str,
					index,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				index = res.x2 - 1
				continue
			}
			// No-op
			break
		// <Strikethrough>
		case char === "~":
			// ~~Strikethrough~~
			if (nchars >= "~~x~~".length && str.slice(index, index + 2) === "~~") {
				const res = parseType({
					type: typeEnum.Strikethrough,
					syntax: char.repeat(2),
					str,
					index,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				index = res.x2 - 1
				continue
			// ~Strikethrough~
			} else if (nchars >= "~x~".length) {
				const res = parseType({
					type: typeEnum.Strikethrough,
					syntax: char,
					str,
					index,
				})
				if (!res) {
					// No-op
					break
				}
				parsed.push(res.parsed)
				index = res.x2 - 1
				continue
			}
			// No-op
			break
		// <Code>
		case char === "`":
			// `Code`
			const res = parseType({
				type: typeEnum.Code,
				syntax: char,
				str,
				index,
			})
			if (!res) {
				// No-op
				break
			}
			parsed.push(res.parsed)
			index = res.x2 - 1
			continue

			// // <A> (1 of 2)
			// case char === "h":
			// 	// https://
			// 	//
			// 	// TODO: Eat "www."
			// 	if (nchars >= HTTPS.length && str.slice(index, index + HTTPS.length) === HTTPS) {
			// 		const matches = safeURLRe.exec(str.slice(index))
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
			// 		index += offset - 1
			// 		continue
			// 	// http://
			// 	//
			// 	// TODO: Eat "www."
			// 	} else if (nchars >= HTTP.length && str.slice(index, index + HTTP.length) === HTTP) {
			// 		const matches = safeURLRe.exec(str.slice(index))
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
			// 		index += offset - 1
			// 		continue
			// 	}
			// 	// No-op
			// 	break
			// // <A> (2 of 2)
			// case char === "[":
			// 	// [A](href)
			// 	if (nchars >= "[x](x)".length) {
			// 		const lhs = registerType(null, "]")(str, index)
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
			// 		index = rhs.x2 - 1
			// 		continue
			// 	}
			// 	// No-op
			// 	break

		default:

			// // <E>
			// //
			// // eslint-disable-next-line no-case-declarations
			// const e = emojiTrie.atStart(str.slice(index))
			// if (e && e.status === "fully-qualified") {
			// 	data.push({
			// 		type: E,
			// 		description: e.description,
			// 		children: e.emoji,
			// 	})
			// 	index += e.emoji.length - 1
			// 	continue
			// }

			break
		}
		if (!parsed.length || typeof parsed[parsed.length - 1] !== "string") {
			parsed.push(char)
			continue
		}
		parsed[parsed.length - 1] += char
	}
	// Return a string or an array of objects:
	if (parsed.length === 1 && typeof parsed[0] === "string") {
		return parsed[0]
	}
	return parsed
}

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
function parseElements(unparsed) {
	const parsed = []
	for (let x = 0; x < unparsed.length; x++) {
		const each = unparsed[x]
		const char = each.raw.charAt(0)
		const nchars = each.raw.length
		switch (true) {
		// <Header>
		case char === "#":
			// # H1 ... ###### H6
			if (
				(nchars >= 2 && each.raw.slice(0, 2) === "# ") ||
				(nchars >= 3 && each.raw.slice(0, 3) === "## ") ||
				(nchars >= 4 && each.raw.slice(0, 4) === "### ") ||
				(nchars >= 5 && each.raw.slice(0, 5) === "#### ") ||
				(nchars >= 6 && each.raw.slice(0, 6) === "##### ") ||
				(nchars >= 7 && each.raw.slice(0, 7) === "###### ")
			) {
				const syntax = each.raw.slice(0, each.raw.indexOf(" ") + 1)
				parsed.push({
					type: typeEnum.Header,
					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
					id: each.id,
					syntax: [syntax],
					// hash: newHash(toInnerString(parseInlineElements(each.raw.slice(syntax.length)))),
					hash: "TODO",
					raw: each.raw,
					children: parseInlineElements(each.raw.slice(syntax.length)),
				})
				continue
			}
			break
		default:
			// No-op
			break
		}
		// <Paragraph>
		const children = parseInlineElements(each.raw)
		parsed.push({
			type: typeEnum.Paragraph,
			id: each.id,
			// emojis: (
			// 	children &&
			// 	children.every &&
			// 	children.every(each => each.type === E)
			// ),
			raw: each.raw,
			children,
		})
	}
	return parsed
}

// // Parses GFM str to a VDOM representation.
// export function parseGFM(str) {
// 	const newHash = newHashEpoch()
//
// 	const data = []
// 	const body = str.split("\n")
// 	for (let index = 0; index < body.length; index++) {
// 		const each = body[index]
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
// 				const x1 = index
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
// 				index = x2 - 1
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
// 				index + 1 < body.length
// 			) {
// 				const x1 = index
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
// 					index = x1
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
// 				index = x2 - 1
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
// 				const x1 = index
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
// 				index = x2 - 1
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
