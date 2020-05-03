import typeEnum from "./typeEnum"
import { isAlphanum } from "lib/encoding/ascii"

import {
	AnyListRe,
	parseAnyList,
} from "./parseAnyList"

// Tests whether a node is a header node.
function testHeader(node) {
	const ok = (
		node.data.slice(0, 2) === "# " ||
		node.data.slice(0, 3) === "## " ||
		node.data.slice(0, 4) === "### " ||
		node.data.slice(0, 5) === "#### " ||
		node.data.slice(0, 6) === "##### " ||
		node.data.slice(0, 7) === "###### "
	)
	return ok
}

// Tests whether a node is a blockquote node.
function testBlockquote(node) {
	const syntax = node.data.slice(0, 2)
	const ok = (
		syntax === "> " ||
		syntax === ">"
	)
	return ok
}

// Tests whether a node is a preformatted (start) node.
function testPreformattedStart(node) {
	const syntax = node.data.slice(0, 3)
	const ok = (
		syntax === "```" ||
		syntax === "~~~"
	)
	return ok
}

// Tests whether a node is a preformatted (end) node.
function testPreformattedEnd(node, syntax) {
	return node.data === syntax
}

// Tests whether a node is an <AnyList> node.
function testAnyList(node) {
	return AnyListRe.test(node.data)
}

// Tests whether a node is a break node.
function testBreak(node) {
	return node.data === "---" || node.data === "***" /* || node.data === "___" */
}

// Parses a header element.
//
// TODO: Add hash
function parseHeader(node) {
	const syntax = `${node.data.split(" ", 1)[0]} `
	const element = {
		type: typeEnum.Header,
		tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
		id: node.id,
		syntax: [syntax],
		// hash: newHash(toInnerText(parseInlineElements(node.data.slice(syntax.length)))),
		// children: parseInlineElements(node.data.slice(syntax.length)),
		children: node.data.slice(syntax.length),
	}
	return element
}

// Parses a paragraph element.
function parseParagraph(node) {
	const element = {
		type: typeEnum.Paragraph,
		id: node.id,
		// emojis: (
		// 	children &&
		// 	children.every &&
		// 	children.every(each => each && each.type && each.type === typeEnum.Emoji) &&
		// 	children.length
		// ),
		children: node.data,
	}
	return element
}

// Parses a blockquote element.
function parseBlockquote(range) {
	const element = {
		type: typeEnum.Blockquote,
		id: range[0].id,
		children: range.map(each => ({
			type: typeEnum.BlockquoteItem,
			id: each.id,
			syntax: [each.data.slice(0, 2)],
			children: each.data.slice(2), // parseInlineElements(each.data.slice(2)),
		})),
	}
	return element
}

// Gets the info string and extension from a node.
//
// https://github.github.com/gfm/#info-string
function getInfoAndExtension(node) {
	const info = node.data.slice(3)
	const metadata = {
		info,
		extension: info.split(".").slice(-1)[0].toLowerCase(),
	}
	return metadata
}

// Parses a preformatted element.
function parsePreformatted(range) {
	const { info, extension } = getInfoAndExtension(range[0])
	const element = {
		type: typeEnum.Preformatted,
		id: range[0].id,
		syntax: [range[0].data, range[range.length - 1].data],
		info,
		extension,
		children: range.slice(1, range.length - 1),
	}
	return element
}

// Parses a break element.
function parseBreak(node) {
	const element = {
		type: typeEnum.Break,
		id: node.id,
		syntax: [node.data],
		children: null,
	}
	return element
}

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
