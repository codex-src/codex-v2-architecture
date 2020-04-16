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

// Registers a type for parseInline.
//
// FIXME
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
	const parse = (str, index, { minOffset } = { minOffset: 1 }) => {
		// Guard: Character before start underscore syntax must
		// be whitespace or punctutation:
		//
		// https://github.github.com/gfm/#example-369
		if (syntax[0] === "_" && index - 1 >= 0 && (!isASCIIWhitespace(str[index - 1]) && !isASCIIPunctuation(str[index - 1]))) {
			return null
		}
		// Guard: Most syntax cannot surround spaces:
		const offset = str.slice(index + syntax.length).search(pattern) + patternOffset
		if (
			offset < minOffset ||
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && isASCIIWhitespace(str[index + syntax.length])) ||           // Exempt <Code> and <A>
			(syntax !== "`" && syntax !== "]" && syntax !== ")" && isASCIIWhitespace(str[index + syntax.length + offset - 1])) // Exempt <Code> and <A>
		) {
			return null
		}
		index += syntax.length
		const data = {
			type,
			syntax,
			children: !opts.recurse
				? str.slice(index, index + offset)
				: parseInline(str.slice(index, index + offset)),
		}
		index += syntax.length + offset
		return { data, x2: index }
	}
	return parse
}

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


// Registers a type for parseInline.
//
// NOTE: Assumes start syntax was checked
function parseType({
	type,      // The parsed enum type
	syntax,    // The syntax (end syntax) // TODO: Rename to endSyntax?
	str,       // Argument string
	index,     // Arugment index (number)
	recursive, // Is recursive?  -- defaults to true
	minOffset, // Minimum offset -- defaults to 1
}) {
	const recurse = parseType

	// Set default value for recursive:
	if (recursive === undefined) {
		recursive = true
	}
	// Set default value for minOffset:
	if (minOffset === undefined) {
		minOffset = 1
	}

	// if (!(index < str.length && str.slice(index, index + syntax.length) === syntax && str.length - index >= phrase.length)) {
	// 	return null
	// }

	// Prepare an escaped search regex:
	let searchRe = syntax.split("").map(each => `\\${each}`).join("")
	let searchReOffset = 0
	switch (syntax[0]) {
	case "_":
		// Underscores cannot be escaped and must be proceeded
		// by a space or an ASCII punctuation character:
		if (index - 1 >= 0 && !(isASCIIWhitespace(str[index - 1]) || isASCIIPunctuation(str[index - 1]))) {
			return null
		}
		searchRe = `[^\\\\]${searchRe}(${ASCIIWhitespacePattern}|${ASCIIPunctuationPattern}|$)`
		searchReOffset++
		break
	case "`":
		// No-op
		break
	default:
		// Etc. cannot be escaped:
		searchRe = `[^\\\\]${searchRe}`
		searchReOffset++
		break
	}

	// TODO
	// (syntax !== "`" && syntax !== "]" && syntax !== ")" && isASCIIWhitespace(str[index + syntax.length])) ||           // Exempt <Code> and <A>
	// (syntax !== "`" && syntax !== "]" && syntax !== ")" && isASCIIWhitespace(str[index + syntax.length + offset - 1])) // Exempt <Code> and <A>

	// Guard: Most syntax cannot surround spaces:
	const offset = str.slice(index + syntax.length).search(searchRe) + searchReOffset
	if (offset < minOffset) {
		return null
	}
	index += syntax.length
	const parsed = {
		type,
		syntax,
		children: !recursive ? str.slice(index, index + offset) : recurse(str.slice(index, index + offset)),
	}
	index += syntax.length + offset
	return { parsed, index }
}

// Parses a GitHub Flavored Markdown (GFM) inline data
// structure from a string.
//
// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInline(str) {
	if (!str) {
		return null
	}
	const data = []
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

		// <StrongEm>
		// <Strong>
		// <Em>
		case char === "*" || char === "_":
			// ***Strong em***
			if (nchars >= "***x***".length && str.slice(index, index + 3) === char.repeat(3)) {
				const parsed = registerType(typeEnum.StrongEmphasis, char.repeat(3))(str, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			// **Strong**
			// __strong__
			} else if (nchars >= "**x**".length && str.slice(index, index + 2) === char.repeat(2)) {
				const parsed = registerType(typeEnum.Strong, char.repeat(2))(str, index)
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
				const parsed = registerType(typeEnum.Emphasis, char)(str, index)
				if (!parsed) {
					// No-op
					break
				}
				data.push(parsed.data)
				index = parsed.x2 - 1
				continue
			}
			// No-op
			break

			// // <Strike>
			// case char === "~":
			// 	// ~~Strike~~
			// 	if (nchars >= "~~x~~".length && str.slice(index, index + 2) === "~~") {
			// 		const parsed = registerType(Strike, "~~")(str, index)
			// 		if (!parsed) {
			// 			// No-op
			// 			break
			// 		}
			// 		data.push(parsed.data)
			// 		index = parsed.x2 - 1
			// 		continue
			// 	// ~Strike~
			// 	} else if (nchars >= "~x~".length) {
			// 		const parsed = registerType(Strike, "~")(str, index)
			// 		if (!parsed) {
			// 			// No-op
			// 			break
			// 		}
			// 		data.push(parsed.data)
			// 		index = parsed.x2 - 1
			// 		continue
			// 	}
			// 	// No-op
			// 	break

		// <Code>
		case char === "`":
			// `Code`
			const res = parseType({ type: typeEnum.Code, syntax: "`", str, index, recursive: false })
			if (res) {
				data.push(res.parsed)
				index = res.index - 1
				continue
			}
			// No-op
			break

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

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
function parse(unparsed) {
	const parsed = []
	for (let x = 0; x < unparsed.length; x++) {
		const each = unparsed[x]
		const char = each.raw.charAt(0)
		const nchars = each.raw.length
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
					// hash: newHash(toInnerString(parseInline(each.raw.slice(syntax.length)))),
					hash: "TODO",
					raw: each.raw,
					children: parseInline(each.raw.slice(syntax.length)),
				})
				continue
			}
			break
		default:
			// No-op
			break
		}
		// <Paragraph>
		const children = parseInline(each.raw)
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
// 					hash: newHash(toInnerString(parseInline(each.slice(syntax.length)))),
// 					children: parseInline(each.slice(syntax.length)),
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
// 						children: parseInline(each.slice(2)),
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
// 		// TODO: Move to parseInline to support
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
// 		const children = parseInline(each)
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

export default parse
