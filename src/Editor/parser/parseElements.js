import typeEnum from "../typeEnum"
import { isAlphanum } from "lib/encoding/ascii"

import {
	parseBlockquote,
	parseBreak,
	parseHeader,
	parseParagraph,
	parsePreformatted,
} from "./parse"

import {
	AnyListRe,
	parseAnyList,
} from "./parseAnyList"

import {
	testAnyList,
	testBlockquote,
	testBreak,
	testHeader,
	testPreformattedEnd,
	testPreformattedStart,
} from "./test"

// Parses a GitHub Flavored Markdown (GFM) data structure.
function parseElements(nodes /* , cache */) {
	const elements = []
	for (let x1 = 0; x1 < nodes.length; x1++) {
		const each = nodes[x1]
		// Fast pass:
		if (!each.data.length || (isAlphanum(each.data[0]) /* && each.data[0] !== "h" */) || each.data === " ") {
			elements.push(parseParagraph(each))
			continue
		}
		switch (each.data[0]) {
		// <Header>
		case "#":
			if (testHeader(each)) {
				elements.push(parseHeader(each))
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
				elements.push(parseBlockquote(range))
				x1 = x2
				continue
			}
			// No-op
			break
		// <Preformatted>
		case "`":
		case "~":
			if (testPreformattedStart(each)) {
				let x2 = x1
				x2++
				const syntax = each.data.slice(0, 3)
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
				elements.push(parsePreformatted(range))
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
				elements.push(parseAnyList(range))
				x1 = x2
				continue
			} else if (testBreak(each)) {
				elements.push(parseBreak(each))
				continue
			}
			// No-op
			break
		default:
			// No-op
			break
		}
		// <Paragraph>
		elements.push(parseParagraph(each))
	}
	return elements
}

export default parseElements
