import * as ascii from "lib/encoding/ascii"
import * as emojiTrie from "emoji-trie"
import * as utf8 from "lib/encoding/utf8"
import typeEnum from "../Elements/typeEnum"
import { URLRegex } from "../regexes"

function isASCIIPunctuationOrUTF8Space(char) {
	const ok = (
		ascii.isPunctuation(char) ||
		utf8.isHWhiteSpace(char)
	)
	return ok
}

// Computes the end-syntax offset.
function computeEndSyntaxOffset({ type, syntax, substr }) {
	// Non-code breaks at non-escaped end-syntax and when
	// proceeded by an ASCII punctuation character, UTF-8
	// space, or EOL.
	const foundNonCodeEndSyntax = offset => {
		const ok = (
			substr.slice(offset).startsWith(syntax) &&
			(offset - 1 >= 0 && substr[offset - 1] !== "\\") &&
			(offset + syntax.length === substr.length || isASCIIPunctuationOrUTF8Space(substr[offset + syntax.length]))
		)
		return ok
	}
	// Code breaks at non-escaped end-syntax and when
	// proceeded by an ASCII punctuation character, UTF-8
	// space, or EOL.
	const foundCodeEndSyntax = offset => {
		const ok = (
			substr.slice(offset).startsWith(syntax) &&
			(offset + syntax.length === substr.length || isASCIIPunctuationOrUTF8Space(substr[offset + syntax.length]))
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
	const offset = computeEndSyntaxOffset({ type, syntax, substr })
	if (offset <= syntax.length) {
		return null
	}
	const match = substr.slice(0, offset + syntax.length)
	const submatch = match.slice(syntax.length, -syntax.length)

	// // Non-code submatches cannot be surrounded by spaces:
	// if (type !== typeEnum.Code && (
	// 	utf8.isHWhiteSpace(submatch[0]) ||
	// 	utf8.isHWhiteSpace(submatch[submatch.length - 1]))
	// ) {
	// 	return null
	// // Syntax and submatch cannot be redundant:
	// } else if (
	// 	submatch[0] === syntax[0] ||
	// 	submatch[submatch.length - 1] === syntax[syntax.length - 1]) {
	// 	return null
	// }

	const element = {
		type,
		syntax,
		children: !(type === typeEnum.Code || (type === typeEnum.Anchor && syntax === ")"))
			? parseInlineElements(submatch)
			: submatch,
	}
	return { element, match, submatch }
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
		const char = str[x1]

		// Fast pass:
		if ((ascii.isStrictAlphanum(char) && char !== "h") || char === " ") {
			if (!elements.length || typeof elements[elements.length - 1] !== "string") {
				elements.push(char)
				continue
			}
			elements[elements.length - 1] += char
			continue
		}

		// Inline elements must be preceded by an ASCII
		// punctuation character, UTF-8 space, or BOL:
		if (x1 - 1 >= 0 && str[x1 - 1] <= "\u007f" && !isASCIIPunctuationOrUTF8Space(str[x1 - 1])) {
			if (!elements.length || typeof elements[elements.length - 1] !== "string") {
				elements.push(char)
				continue
			}
			elements[elements.length - 1] += char
			continue
		}

		const substr = str.slice(x1)
		switch (char) {
		// <Escape>
		case "\\":
			// \Escape
			if (substr.length >= 2 && ascii.isPunctuation(substr[1])) {
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
		// <StrongEmphasis> or <Strong> or <Emphasis>
		case "_":
		case "*":
			// ***Strong emphasis*** or ___Strong emphasis___
			if (substr.length >= "***?***".length && substr.startsWith(char.repeat(3))) {
				const result = parseInlineElement({
					type: typeEnum.StrongEmphasis,
					syntax: char.repeat(3),
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			// **Strong** or __Strong__
			} else if (substr.length >= "**?**".length && substr.startsWith(char.repeat(2))) {
				const result = parseInlineElement({
					type: typeEnum.Strong,
					syntax: char.repeat(2),
					substr,
				})
				if (!result) {
					// No-op
					break
				}
				elements.push(result.element)
				x1 += result.match.length - 1
				continue
			// *Emphasis* or _Emphasis_
			} else if (substr.length >= "*?*".length) {
				const result = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: char.repeat(1),
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
		// <Code> and <Strikethrough>
		case "`":
		case "~":

			// // ```Code``` or ~~~Code~~~
			// if (substr.length >= "```?```".length && substr.startsWith(char.repeat(3))) {
			// 	const result = parseInlineElement({
			// 		type: typeEnum.Code,
			// 		syntax: char.repeat(3),
			// 		substr,
			// 	})
			// 	if (!result) {
			// 		// No-op
			// 		break
			// 	}
			// 	elements.push(result.element)
			// 	x1 += result.match.length - 1
			// 	continue

			// ~~Strikethrough~~
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
			// `Code` or ~Code~
			} else if (substr.length >= "~?~".length) {
				const result = parseInlineElement({
					type: typeEnum.Code,
					syntax: char,
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
			if (substr.length >= "http://".length && (substr.startsWith("https://") || substr.startsWith("http://"))) {
				const matches = substr.match(URLRegex)
				let [, syntax, children] = matches

				// NOTE: String.match returns undefined for optional
				// groups
				if (children === undefined) {
					children = ""
				}

				if (children.length && ascii.isPunctuation(children[children.length - 1]) && children[children.length - 1] !== "/") {
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
		// <Anchor> (2 of 2)
		case "[":
			// [Anchor](href)
			if (substr.length >= "[?](?)".length) {
				const lhs = parseInlineElement({
					type: typeEnum.Anchor,
					syntax: "]",
					substr,
				})
				if (!lhs) {
					// No-op
					break
				}
				if (lhs.match.length < substr.length && substr[lhs.match.length] !== "(") {
					// No-op
					break
				}
				const rhs = parseInlineElement({
					type: typeEnum.Anchor,
					syntax: ")",
					substr: substr.slice(lhs.match.length),
				})
				if (!rhs) {
					// No-op
					break
				}
				elements.push({
					type: typeEnum.Anchor,
					syntax: ["[", "](" + rhs.element.children + ")"],
					href: rhs.element.children,
					children: lhs.element.children,
				})
				x1 += lhs.match.length + rhs.match.length - 1
				continue
			}
			// No-op
			break
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
	if (elements.length === 1 && typeof elements[0] === "string") {
		return elements[0]
	}
	return elements
}

export default parseInlineElements
