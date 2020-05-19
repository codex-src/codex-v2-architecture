import * as emojiTrie from "emoji-trie"
import * as spec from "./spec"
import typeEnum from "../Elements/typeEnum"
import { isStrictAlphanum } from "lib/encoding/ascii"

// Returns whether a character is an ASCII punctuation or
// white space character.
function isASCIIPunctuationOrWhiteSpace(char) {
	const ok = (
		spec.isASCIIPunctuation(char) ||
		spec.isASCIIWhiteSpace(char)
	)
	return ok
}

// Computes the end-syntax offset.
function computeEndSyntaxOffset({ type, syntax, substr }) {
	// Non-code breaks at non-escaped end-syntax and proceeded
	// by punctuation, space, or EOL.
	const foundNonCodeEndSyntax = offset => {
		const ok = (
			substr.slice(offset).startsWith(syntax) &&
			(offset - 1 >= 0 && substr[offset - 1] !== "\\") &&
			(offset + syntax.length === substr.length || isASCIIPunctuationOrWhiteSpace(substr[offset + syntax.length]))
		)
		return ok
	}
	// Code breaks at end-syntax and proceeded by punctuation,
	// space, or EOL.
	const foundCodeEndSyntax = offset => {
		const ok = (
			substr.slice(offset).startsWith(syntax) &&
			(offset + syntax.length === substr.length || isASCIIPunctuationOrWhiteSpace(substr[offset + syntax.length]))
		)
		return ok
	}
	let offset = syntax.length
	const foundEndSyntax = type !== typeEnum.Code ? foundNonCodeEndSyntax : foundCodeEndSyntax
	for (; offset < substr.length; offset++) {
		if (foundEndSyntax(offset)) {
			// No-op
			break
		}
	}
	if (offset === substr.length) {
		offset = -1
	}
	return offset
}

// Parses a GitHub Flavored Markdown inline element.
function parseInlineElement({ type, syntax, substr }) {
	// Matches cannot be empty:
	const offset = computeEndSyntaxOffset({ type, syntax, substr })
	if (offset <= 0) {
		return null
	}
	const match = substr.slice(0, offset + syntax.length)
	const submatch = match.slice(syntax.length, -syntax.length)
	// Non-code submatches cannot be surrounded by spaces:
	if (type !== typeEnum.Code && (
		spec.isASCIIWhiteSpace(submatch[0]) ||
		spec.isASCIIWhiteSpace(submatch[submatch.length - 1]))
	) {
		return null
	// Syntax and submatch cannot be redundant:
	} else if (
		submatch[0] === syntax[0] ||
		submatch[submatch.length - 1] === syntax[syntax.length - 1]) {
		return null
	}
	const element = {
		type,
		syntax,
		children: !(type === typeEnum.Code || (type === typeEnum.Anchor && syntax === ")"))
			? parseInlineElements(submatch)
			: submatch,
	}
	return { element, match, submatch }
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
		const char = str[x1]

		// Fast pass:
		if ((isStrictAlphanum(char) && char !== "h") || char === " " || char > "\u007f") {
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

		// NOTE: Allocate substr after fast pass and bounds
		// checks
		const substr = str.slice(x1)

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
	// if (elements.length === 1 && typeof elements[0] === "string") {
	// 	return elements[0]
	// }
	return elements
}

export default parseInlineElements
