import * as emojiTrie from "emoji-trie"
import * as spec from "./spec"
import typeEnum from "../Elements/typeEnum"

import {
	isAlphanum,
	isStrictAlphanum,
} from "lib/encoding/ascii"

// Parses a GitHub Flavored Markdown inline element.
//
// TODO: Use substr not str? What about x1 - 1?
function parseInlineElement({ type, syntax, str, x1 }) {
	// Syntax must be preceded by a BOL, space, or ASCII
	// punctuation character:
	//
	// TODO: Move to parseInlineElements?
	if (x1 - 1 >= 0 && !(spec.isASCIIWhiteSpace(str[x1 - 1]) || spec.isASCIIPunctuation(str[x1 - 1]))) { // E.g. " *text*"
		return null
	}
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
	const offset = str.slice(x1 + syntax.length).search(pattern) + patternOffset
	if (offset <= 0) {
		return null
	// Match cannot be surrounded by a space (non-code):
	} else if (type !== typeEnum.Code && (
		spec.isASCIIWhiteSpace(str[x1 + syntax.length]) ||           // E.g. "* text"
		spec.isASCIIWhiteSpace(str[x1 + syntax.length + offset - 1]) // E.g. "text *"
	)) {
		return null
	// Match start or end cannot be redundant:
	} else if (
		str[x1 + syntax.length] === syntax[0] ||                              // E.g. "****text"
		str[x1 + syntax.length + offset - 1] === syntax[syntax.length - 1]) { // E.g. "text****"
		return null
	}
	// Increment start syntax (assumes start and end syntax
	// are the same):
	x1 += syntax.length
	const element = {
		type,
		syntax,
		children: !(type === typeEnum.Code || (type === typeEnum.Anchor && syntax === ")"))
			? parseInlineElements(str.slice(x1, x1 + offset))
			: str.slice(x1, x1 + offset),
	}
	// Increment offset and end syntax:
	const x2 = x1 + offset + syntax.length
	return { element, x2 }
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

// Parses GitHub Flavored Markdown inline elements.
//
// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) {
	if (!str) {
		return null
	}
	const elements = []
	for (let x1 = 0, len = str.length; x1 < len; x1++) {
		const substr = str.slice(x1)
		const nchars = substr.length
		const char = substr[0]

		// const char = str[x1]
		// const nchars = str.length - x1 // DEPRECATE

		// Fast pass:
		if ((testFastPass(char) && char !== "h") || char === " ") {
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
			if (nchars >= 2 && spec.isASCIIPunctuation(substr[1])) {
				elements.push({
					type: typeEnum.Escape,
					syntax: ["\\"],
					children: str[x1 + 1],
				})
				x1++
				continue
			}
			// No-op
			break
		// <Emphasis>
		case "_":
			// _Emphasis_
			if (nchars >= "_?_".length) {
				const result = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: "_",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			}
			// No-op
			break
		// <StrongEmphasis> or <Strong> or <Emphasis>
		case "*":
			// ***Strong emphasis***
			if (nchars >= "***?***".length && substr.startsWith("***")) {
				const result = parseInlineElement({
					type: typeEnum.StrongEmphasis,
					syntax: "***",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			// **Strong**
			} else if (nchars >= "**?**".length && substr.startsWith("**")) {
				const result = parseInlineElement({
					type: typeEnum.Strong,
					syntax: "**",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			// *Emphasis*
			} else if (nchars >= "*?*".length) {
				const result = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: "*",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			}
			// No-op
			break
		// <Code> (1 of 2)
		case "`":
			// `Code`
			if (nchars >= "`?`".length) {
				const result = parseInlineElement({
					type: typeEnum.Code,
					syntax: "`",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			}
			// No-op
			break
		// <Code> (2 of 2) or <Strikethrough>
		case "~":
			// ~~Strikethrough~~ (takes precedence)
			if (nchars >= "~~?~~".length && substr.startsWith("~~")) {
				const result = parseInlineElement({
					type: typeEnum.Strikethrough,
					syntax: "~~",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			// ~Code~
			} else if (nchars >= "~?~".length) {
				const result = parseInlineElement({
					type: typeEnum.Code,
					syntax: "~",
					str,
					x1,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 = result.x2 - 1
				continue
			}
			// No-op
			break

		// <Anchor> (1 of 2)
		case "h":
			// NOTE: Use spec.HTTP.length not spec.HTTPS.length
			if (nchars >= spec.HTTP.length && (substr.startsWith(spec.HTTPS) || substr.startsWith(spec.HTTP))) {
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
			// 	if (nchars >= "[?](?)".length) {
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
			const metadata = emojiTrie.atStart(substr)
			if (metadata && metadata.status === "fully-qualified") {
				elements.push({
					type: typeEnum.Emoji,
					description: metadata.description,
					children: metadata.emoji,
				})
				x1 += metadata.emoji.length - 1
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
	if (elements.length === 1 && typeof elements[0] === "string") {
		return elements[0]
	}
	return elements
}

export default parseInlineElements
