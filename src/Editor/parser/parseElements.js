import parseAnyList from "./parseAnyList"
import { isStrictAlphanum } from "lib/encoding/ascii"

import {
	parseBlockquote,
	parseBreak,
	parseHeader,
	parseParagraph,
	parsePreformatted,
} from "./parsers"

import {
	testAnyList,
	testBlockquote,
	testBreak,
	testHeader,
	testPreformattedEnd,
	testPreformattedStart,
} from "./testers"

// Creates a new URL hash epoch.
function newURLHashEpoch() {
	const hashes = {}
	const newURLHash = str => {
		// ALPHA / DIGIT / "-" / "." / "_" / "~"
		//
		// https://tools.ietf.org/html/rfc3986
		//
		/* eslint-disable no-useless-escape */
		const hash = str
			.toLowerCase()               // Lowercase
			.replace(/(\s+|\-+)/g, "-")  // Convert spaces to dashes
			.replace(/[^a-z0-9\-]/g, "") // Remove non-alphanumerics (strict)
			.replace(/\-+/g, "-")        // Remove extraneous dashes (1 of 2)
			.replace(/(^\-|\-$)/g, "")   // Remove extraneous dashes (2 of 2)
		/* eslint-enable no-useless-escape */
		const seen = hashes[hash]
		if (!seen) {
			hashes[hash] = 0
		}
		hashes[hash]++
		return hash + (!seen ? "" : `-${hashes[hash]}`)
	}
	return newURLHash
}

// Parses GitHub Flavored Markdown elements.
function parseElements(nodes, cachedElements) {
	const newURLHash = newURLHashEpoch()

	const cacheStrategy = (range, parser) => {
		const key = !Array.isArray(range) ? range.data : range.map(each => each.data).join("\n")
		let element = cachedElements.get(key)
		if (!element) {
			element = parser(range)
			cachedElements.set(key, element)
		}
		const { id } = !Array.isArray(range) ? range : range[0]
		return { ...element, id }
	}

	const elements = []
	for (let x1 = 0; x1 < nodes.length; x1++) {
		const each = nodes[x1]
		// Fast pass:
		//
		// NOTE: Use isStrictAlphanum (because of "_")
		if (!each.data.length || (isStrictAlphanum(each.data[0]) /* && each.data[0] !== "h" */) || each.data[0] === " ") {
			const element = cacheStrategy(each, parseParagraph)
			elements.push(element)
			continue
		}
		switch (each.data[0]) {
		// <Header>
		case "#":
			if (testHeader(each)) {
				const element = cacheStrategy(each, each => parseHeader(each, newURLHash))
				elements.push(element)
				continue
			}
			// No-op
			break
		// <Blockquote>
		case ">":
			if (testBlockquote(each)) {
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					const each = nodes[x2]
					if (!testBlockquote(each)) {
						x2-- // One too many; decrement
						break
					}
				}
				const range = nodes.slice(x1, x2 + 1)
				const element = cacheStrategy(range, parseBlockquote)
				elements.push(element)
				x1 = x2
				continue
			}
			// No-op
			break
		// <Preformatted>
		case "`":
		case "~":
			if (testPreformattedStart(each)) {
				const syntax = each.data.slice(0, 3)
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					const each = nodes[x2]
					if (testPreformattedEnd(each, syntax)) {
						// No-op; do not decrement
						break
					}
				}
				// Guard unterminated:
				if (x2 === nodes.length) {
					// No-op
					break
				}
				const range = nodes.slice(x1, x2 + 1)
				const element = cacheStrategy(range, parsePreformatted)
				elements.push(element)
				x1 = x2
				continue
			}
			// No-op
			break
		// <AnyList> or <Break>
		case "\t":
		case "-":
		case "*":
		case "0":
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			if (testAnyList(each)) {
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					const each = nodes[x2]
					if (!testAnyList(each)) {
						x2-- // One too many; decrement
						break
					}
				}
				const range = nodes.slice(x1, x2 + 1)
				const element = cacheStrategy(range, parseAnyList)
				elements.push(element)
				x1 = x2
				continue
			} else if (testBreak(each)) {
				const element = cacheStrategy(each, parseBreak)
				elements.push(element)
				continue
			}
			// No-op
			break
		default:
			// No-op
			break
		}
		// <Paragraph>
		const element = cacheStrategy(each, parseParagraph)
		elements.push(element)
	}
	return elements
}

export default parseElements
