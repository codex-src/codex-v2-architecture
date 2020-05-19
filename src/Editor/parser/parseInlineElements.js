import * as emojiTrie from "emoji-trie"
import * as spec from "./spec"
import typeEnum from "../Elements/typeEnum"

import {
	isAlphanum,
	isStrictAlphanum,
} from "lib/encoding/ascii"

// Parses a GitHub Flavored Markdown inline element.
function parseInlineElement({ type, syntax, substr }) {
	// Prepare an escaped regex pattern:
	let pattern = syntax.split("").map(each => `\\${each}`).join("")
	let patternOffset = 0
	if (type !== typeEnum.Code) {
		pattern = `[^\\\\]${pattern}`
		patternOffset++
	}
	// Syntax must be proceeded by a space, punctuation
	// character, or EOL:
	pattern += `(${spec.ASCIIWhiteSpacePattern}|${spec.ASCIIPunctuationPattern}|$)`
	// Match cannot be empty:
	const offset = substr.slice(syntax.length).search(pattern) + patternOffset
	if (offset <= 0) {
		return null
	// Match cannot be surrounded by a space (non-code):
	} else if (type !== typeEnum.Code && (
		spec.isASCIIWhiteSpace(substr[syntax.length]) ||           // E.g. "* text"
		spec.isASCIIWhiteSpace(substr[syntax.length + offset - 1]) // E.g. "text *"
	)) {
		return null
	// Match start or end cannot be redundant:
	} else if (
		substr[syntax.length] === syntax[0] ||                              // E.g. "****text"
		substr[syntax.length + offset - 1] === syntax[syntax.length - 1]) { // E.g. "text****"
		return null
	}
	const match = substr.slice(0, syntax.length + offset + syntax.length)
	const element = {
		type,
		syntax,
		children: !(type === typeEnum.Code || (type === typeEnum.Anchor && syntax === ")"))
			? parseInlineElements(match.slice(syntax.length, -syntax.length))
			: match.slice(syntax.length, -syntax.length)
	}
	return { element, match }
}

const codes = {
	A: 0x41, // -> "A"
	Z: 0x5a, // -> "Z"
	a: 0x61, // -> "a"
	z: 0x71, // -> "z"
}

function testFastPass(char) {
	const code = char.codePointAt(0)
	const ok = (
		(code >= codes.A && code <= codes.Z) || // Takes precedence
		(code >= codes.a && code <= codes.z) ||
		(code > 0x7f) // 127
	)
	return ok
}

// TODO: parsers.asterisk?

// Parses GitHub Flavored Markdown inline elements.
//
// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) {
	if (!str) {
		return null
	}
	const elements = []
	for (let x1 = 0, len = str.length; x1 < len; x1++) {
		// TODO: Move substr **after** fast pass?
		const substr = str.slice(x1)
		const char = substr[0]

		// Fast pass:
		if ((testFastPass(char) && char !== "h") || char === " ") {
			// TODO: Extract?
			if (!elements.length || typeof elements[elements.length - 1] !== "string") {
				elements.push(char)
				continue
			}
			elements[elements.length - 1] += char
			continue
		}

		// Inline elements must be preceded by an ASCII white
		// space or punctuation character:
		if (x1 - 1 >= 0 && !(spec.isASCIIWhiteSpace(str[x1 - 1]) || spec.isASCIIPunctuation(str[x1 - 1]))) {
			// TODO: Extract?
			if (!elements.length || typeof elements[elements.length - 1] !== "string") {
				elements.push(char)
				continue
			}
			elements[elements.length - 1] += char
			continue
		}

		switch (char) {
		// <Escape>
		case "\\":
			// \Escape
			if (substr.length >= 2 && spec.isASCIIPunctuation(substr[1])) {
				elements.push({
					type: typeEnum.Escape,
					syntax: ["\\"],
					children: substr[1],
				})
				x1++
				continue
			}
			// No-op
			break
		// <Emphasis>
		case "_":
			// _Emphasis_
			if (substr.length >= "_?_".length) {
				const result = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: "_",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			}
			// No-op
			break
		// <StrongEmphasis> or <Strong> or <Emphasis>
		case "*":
			// ***Strong emphasis***
			if (substr.length >= "***?***".length && substr.startsWith("***")) {
				const result = parseInlineElement({
					type: typeEnum.StrongEmphasis,
					syntax: "***",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			// **Strong**
			} else if (substr.length >= "**?**".length && substr.startsWith("**")) {
				const result = parseInlineElement({
					type: typeEnum.Strong,
					syntax: "**",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			// *Emphasis*
			} else if (substr.length >= "*?*".length) {
				const result = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: "*",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			}
			// No-op
			break
		// <Code> (1 of 2)
		case "`":
			// `Code`
			if (substr.length >= "`?`".length) {
				const result = parseInlineElement({
					type: typeEnum.Code,
					syntax: "`",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			}
			// No-op
			break
		// <Code> (2 of 2) or <Strikethrough>
		case "~":
			// ~~Strikethrough~~ (takes precedence)
			if (substr.length >= "~~?~~".length && substr.startsWith("~~")) {
				const result = parseInlineElement({
					type: typeEnum.Strikethrough,
					syntax: "~~",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			// ~Code~
			} else if (substr.length >= "~?~".length) {
				const result = parseInlineElement({
					type: typeEnum.Code,
					syntax: "~",
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			}
			// No-op
			break

		// <Anchor> (1 of 2)
		case "h":
			// NOTE: Use spec.HTTP.length not spec.HTTPS.length
			if (substr.length >= spec.HTTP.length && (substr.startsWith(spec.HTTPS) || substr.startsWith(spec.HTTP))) {
				const matches = substr.match(spec.URLRegex)
				let [, syntax, children] = matches

				// NOTE: String.match returns undefined for optional
				// groups
				if (children === undefined) {
					children = ""
				}

				if (children.length && spec.isASCIIPunctuation(children[children.length - 1]) && children[children.length - 1] !== "/") {
					children = children.slice(0, children.length - 1)
				}
				elements.push({
					type: typeEnum.Anchor,
					syntax: [syntax],
					href: syntax + children,
					children,
				})
				x1 += (syntax + children).length - 1
				continue
			}
			// No-op
			break

			// // <Anchor> (2 of 2)
			// case "[":
			// 	// [Anchor](href)
			// 	if (substr.length >= "[?](?)".length) {
			// 		const lhs = parseInlineElement({ type: typeEnum.Anchor, syntax: "]", str, x1 })
			// 		if (!lhs) {
			// 			// No-op
			// 			break
			// 		}
			// 		// Check "(" syntax:
			// 		if (lhs.x2 < str.length && str[lhs.x2] !== "(") {
			// 			// No-op
			// 			break
			// 		}
			// 		// lhs.x2++
			// 		const rhs = parseInlineElement({ type: typeEnum.Anchor, syntax: ")", str, x1: lhs.x2 })
			// 		if (!rhs) {
			// 			// No-op
			// 			break
			// 		}
			// 		elements.push({
			// 			type: typeEnum.Anchor,
			// 			// syntax: ["[", "](…)"],
			// 			syntax: ["[", `](${rhs.element.children})`],
			// 			href: rhs.element.children,
			// 			children: lhs.element.children,
			// 		})
			// 		x1 = rhs.x2 - 1
			// 		continue
			// 	}
			// 	// No-op
			// 	break

		// <Emoji>
		default:
			const info = emojiTrie.atStart(substr)
			if (info && info.status === "fully-qualified") {
				elements.push({
					type: typeEnum.Emoji,
					description: info.description,
					children: info.emoji,
				})
				x1 += info.emoji.length - 1
				continue
			}
			// No-op
			break
		}
		if (!elements.length || typeof elements[elements.length - 1] !== "string") {
			elements.push(char)
			continue
		}
		elements[elements.length - 1] += char
	}
	// TODO: Deprecate?
	if (elements.length === 1 && typeof elements[0] === "string") {
		return elements[0]
	}
	return elements
}

export default parseInlineElements
