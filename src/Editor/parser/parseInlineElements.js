import * as emojiTrie from "emoji-trie"
import typeEnum from "../Elements/typeEnum"

import {
	isAlphanum,
	isStrictAlphanum,
} from "lib/encoding/ascii"

import {
	ASCIIPunctuationPattern,
	ASCIIWhiteSpacePattern,
	HTTP,
	HTTPS,
	isASCIIPunctuation,
	isASCIIWhiteSpace,
	SafeURLRe,
} from "./spec"

// Parses a GitHub Flavored Markdown inline element.
function parseInlineElement({ type, syntax, str, x1 }) {
	// Syntax must be preceded by a BOL, space, or ASCII
	// punctuation character:
	if (x1 - 1 >= 0 && !(isASCIIWhiteSpace(str[x1 - 1]) || isASCIIPunctuation(str[x1 - 1]))) { // E.g. "·*match*"
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
	pattern += `(${ASCIIWhiteSpacePattern}|${ASCIIPunctuationPattern}|$)`
	// Match cannot be empty:
	const offset = str.slice(x1 + syntax.length).search(pattern) + patternOffset
	if (offset <= 0) {
		return null
	// Match cannot be surrounded by a space (non-code):
	} else if (type !== typeEnum.Code && (
		isASCIIWhiteSpace(str[x1 + syntax.length]) ||           // E.g. "*·match"
		isASCIIWhiteSpace(str[x1 + syntax.length + offset - 1]) // E.g. "match·*"
	)) {
		return null
	// Match start or end cannot be redundant:
	} else if (
		str[x1 + syntax.length] === syntax[0] ||                              // E.g. "****match"
		str[x1 + syntax.length + offset - 1] === syntax[syntax.length - 1]) { // E.g. "match****"
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

// Parses GitHub Flavored Markdown inline elements.
//
// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) {
	if (!str) {
		return null
	}
	const elements = []
	for (let x1 = 0, len = str.length; x1 < len; x1++) {
		// Fast pass:
		//
		// NOTE: Use isStrictAlphanum because of "_"
		if ((isStrictAlphanum(str[x1]) && str[x1] !== "h") || str[x1] === " ") { // Exempt "h" for "https://" and "http://"
			if (!elements.length || typeof elements[elements.length - 1] !== "string") {
				elements.push(str[x1])
				continue
			}
			elements[elements.length - 1] += str[x1]
			continue
		}
		const n = str.length - x1
		switch (str[x1]) {
		// <Escape>
		case "\\":
			// \*
	 		if (x1 + 1 < str.length && isASCIIPunctuation(str[x1 + 1])) {
				elements.push({
					type: typeEnum.Escape,
					syntax: ["\\"],
					children: str[x1 + 1],
				})
				// Increment to the next character; the punctuation
				// character is auto-incremented:
				x1++
				continue
			}
			// No-op
			break
		// <Emphasis>
		case "_":
			// _Emphasis_
			if (n >= "_?_".length) {
				const res = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: "_",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			}
			// No-op
			break
		// <StrongEmphasis> or <Strong> or <Emphasis>
		case "*":
			// ***Strong emphasis*** (takes precedence)
			if (n >= "***?***".length && str.slice(x1, x1 + 3) === "***") {
				const res = parseInlineElement({
					type: typeEnum.StrongEmphasis,
					syntax: "***",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			// **Strong** (takes precedence)
			} else if (n >= "**?**".length && str.slice(x1, x1 + 2) === "**") {
				const res = parseInlineElement({
					type: typeEnum.Strong,
					syntax: "**",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			// *Emphasis*
			} else if (n >= "*?*".length) {
				const res = parseInlineElement({
					type: typeEnum.Emphasis,
					syntax: "*",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			}
			// No-op
			break
		// <Code> (1 of 2)
		case "`":
			// `Code`
			if (n >= "`?`".length) {
				const res = parseInlineElement({
					type: typeEnum.Code,
					syntax: "`",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			}
			// No-op
			break
		// <Code> (2 of 2) or <Strikethrough>
		case "~":
			// ~~Strikethrough~~ (takes precedence)
			if (n >= "~~?~~".length && str.slice(x1, x1 + 2) === "~~") {
				const res = parseInlineElement({
					type: typeEnum.Strikethrough,
					syntax: "~~",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			// ~Code~
			} else if (n >= "~?~".length) {
				const res = parseInlineElement({
					type: typeEnum.Code,
					syntax: "~",
					str,
					x1,
				})
				if (!res) {
					// No-op
					break
				}
				elements.push(res.element)
				x1 = res.x2 - 1
				continue
			}
			// No-op
			break
			// <Anchor> (1 of 2)
		case "h":
			// https:// or http://
			if (
				(n >= HTTPS.length && str.slice(x1, x1 + HTTPS.length) === HTTPS) ||
				(n >= HTTP.length && str.slice(x1, x1 + HTTP.length) === HTTP)
			) {
				let syntax = `${str.slice(x1).split("://", 1)[0]}://`
				if (str.slice(x1, x1 + syntax.length + 4) === `${syntax}www.`) {
					syntax += "www."
				}
				let [href] = SafeURLRe.exec(str.slice(x1))
				if (href.length === syntax.length) {
					// No-op; defer to end
				} else if (!isAlphanum(href[href.length - 1]) && href[href.length - 1] !== "/") {
					href = href.slice(0, href.length - 1)
				}
				elements.push({
					type: typeEnum.Anchor,
					syntax: [syntax],
					href,
					children: href.slice(syntax.length),
				})
				x1 += href.length - 1
				continue
			}
			// No-op
			break
		// <Anchor> (2 of 2)
		case "[":
			// [Anchor](href)
			if (n >= "[?](?)".length) {
				const lhs = parseInlineElement({ type: typeEnum.Anchor, syntax: "]", str, x1 })
				if (!lhs) {
					// No-op
					break
				}
				// Check "(" syntax:
				if (lhs.x2 < str.length && str[lhs.x2] !== "(") {
					// No-op
					break
				}
				// lhs.x2++
				const rhs = parseInlineElement({ type: typeEnum.Anchor, syntax: ")", str, x1: lhs.x2 })
				if (!rhs) {
					// No-op
					break
				}
				elements.push({
					type: typeEnum.Anchor,
					// syntax: ["[", "](…)"],
					syntax: ["[", `](${rhs.element.children})`],
					href: rhs.element.children,
					children: lhs.element.children,
				})
				x1 = rhs.x2 - 1
				continue
			}
			// No-op
			break
		// <Emoji>
		default:
			// 😀
			const info = emojiTrie.atStart(str.slice(x1))
			if (info && info.status === "fully-qualified") { // TODO: Add "component"?
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
			elements.push(str[x1])
			continue
		}
		elements[elements.length - 1] += str[x1]
	}
	if (elements.length === 1 && typeof elements[0] === "string") {
		return elements[0]
	}
	return elements
}

export default parseInlineElements
