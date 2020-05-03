import * as emojiTrie from "emoji-trie"
import typeEnum from "../typeEnum"
import { isAlphanum } from "lib/encoding/ascii"

import {
	ASCIIPunctuationPattern,
	ASCIIWhiteSpacePattern,
	HTTP,
	HTTPS,
	isASCIIPunctuation,
	isASCIIWhiteSpace,
	SafeURLRe,
} from "./spec"

// Parses a GitHub Flavored Markdown (GFM) type.
function parseGFMType({ type, syntax, str, x }) {
	// Syntax must be preceded by a BOL, space, or ASCII
	// punctuation character:
	if (x - 1 >= 0 && !(isASCIIWhiteSpace(str[x - 1]) || isASCIIPunctuation(str[x - 1]))) { // E.g. "·*match*"
		return null
	}
	// Prepare an escaped regex pattern:
	let pattern = syntax.split("").map(each => `\\${each}`).join("")
	let patternOffset = 0
	if (type !== typeEnum.Code) {
		pattern = `[^\\\\]${pattern}`
		patternOffset++
	}
	// Syntax must be proceeded by a space, EOL, or ASCII
	// punctuation character:
	pattern += `(${ASCIIWhiteSpacePattern}|${ASCIIPunctuationPattern}|$)`
	// Match cannot be empty:
	const offset = str.slice(x + syntax.length).search(pattern) + patternOffset
	if (offset <= 0) { // TODO: Compare typeEnum for ![]() syntax?
		return null
	// Match cannot be surrounded by a space (non-code):
	} else if (type !== typeEnum.Code && (
		isASCIIWhiteSpace(str[x + syntax.length]) ||           // E.g. "*·match"
		isASCIIWhiteSpace(str[x + syntax.length + offset - 1]) // E.g. "match·*"
	)) {
		return null
	// Match start or end cannot be redundant:
	} else if (
		str[x + syntax.length] === syntax[0] ||                              // E.g. "****match"
		str[x + syntax.length + offset - 1] === syntax[syntax.length - 1]) { // E.g. "match****"
		return null
	}
	// Increment start syntax (assumes start and end syntax
	// are the same):
	x += syntax.length
	const parsed = {
		type,
		syntax,
		children: !(type === typeEnum.Code || (type === typeEnum.Anchor && syntax === ")"))
			? parseInlineElements(str.slice(x, x + offset))
			: str.slice(x, x + offset),
	}
	// Increment offset and end syntax:
	x += offset + syntax.length
	return { parsed, x2: x }
}

// TODO: https://github.github.com/gfm/#delimiter-stack
function parseInlineElements(str) {
	if (!str.length) {
		return null
	}
	const parsed = []
	for (let x = 0; x < str.length; x++) {
		// Fast pass:
		if ((isAlphanum(str[x]) && str[x] !== "h") || str[x] === " ") { // Exempt "h" for "https://" and "http://"
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
		// <StrongEmphasis> or <Strong> or <Emphasis>
		case "*":
			// ***Strong emphasis*** (takes precedence)
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
			// **Strong** (takes precedence)
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
		// <Code> (1 of 2)
		case "`":
			// `Code`
			if (nchars >= "`x`".length) {
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
		// <Code> (2 of 2) or <Strikethrough>
		case "~":
			// ~~Strikethrough~~ (takes precedence)
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
			// ~Code~
			} else if (nchars >= "~x~".length) {
				const res = parseGFMType({
					type: typeEnum.Code,
					syntax: "~",
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
			// https:// or http://
			if (
				(nchars >= HTTPS.length && str.slice(x, x + HTTPS.length) === HTTPS) ||
				(nchars >= HTTP.length && str.slice(x, x + HTTP.length) === HTTP)
			) {
				let syntax = `${str.slice(x).split("://", 1)[0]}://`
				if (str.slice(x, x + syntax.length + 4) === `${syntax}www.`) {
					syntax += "www."
				}
				let [href] = SafeURLRe.exec(str.slice(x))
				if (href.length === syntax.length) {
					// No-op; defer to end
				} else if (!isAlphanum(href[href.length - 1]) && href[href.length - 1] !== "/") {
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
			const info = emojiTrie.atStart(str.slice(x))
			if (info && info.status === "fully-qualified") { // TODO: Add "component"?
				parsed.push({
					type: typeEnum.Emoji,
					description: info.description,
					children: info.emoji,
				})
				x += info.emoji.length - 1
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

export default parseInlineElements
