import newURLHashEpoch from "./newURLHashEpoch"
import parseAnyList from "./parseAnyList"
import parseInlineElements from "./parseInlineElements"
import testElements from "./testElements"
import typeEnum from "../Elements/typeEnum"
import { toInnerText } from "../Elements/cmap"

import {
	parseBlockquote,
	parseBreak,
	parseHeader,
	parseParagraph,
	parsePreformatted,
} from "./parsers"

function testFastPass(char) {
	const ok = (
		(char >= "a" && char <= "z") || // char !== "h" &&
		(char >= "A" && char <= "Z") ||
		char === " "
	)
	return ok
}

// Parses GitHub Flavored Markdown elements.
function parseElements(nodes, cachedElements) {
	const newURLHash = newURLHashEpoch()

	const cacheStrategy = (range, parseElement) => {
		const key = !Array.isArray(range) ? range.data : range.map(each => each.data).join("\n")
		let element = cachedElements.get(key)
		if (!element) {
			element = parseElement(range)
			cachedElements.set(key, element)
		}
		return element
	}

	const elements = []
	for (let x1 = 0, len = nodes.length; x1 < len; x1++) {
		const each = nodes[x1]
		// Fast pass:
		if (!each.data.length || testFastPass(each.data[0])) {
			const element = cacheStrategy(each, parseParagraph)
			elements.push({
				...element,
				id: each.id,
			})
			continue
		}
		switch (each.data[0]) {
		// <Header>
		case "#":
			if (testElements.Header(each)) {
				const element = cacheStrategy(each, each => parseHeader(each))
				elements.push({
					...element,
					id: each.id,
					hash: newURLHash(toInnerText(element.children)),
				})
				continue
			}
			// No-op
			break
		// <Blockquote>
		case ">":
			if (testElements.Blockquote(each)) {
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					if (!testElements.Blockquote(nodes[x2])) {
						x2-- // One too many; decrement
						break
					}
				}
				const range = nodes.slice(x1, x2 + 1)
				const element = cacheStrategy(range, parseBlockquote)
				elements.push({
					...element,
					id: each.id,
					children: element.children.map((each, x) => ({
						...each,
						id: range[x].id,
					})),
				})
				x1 = x2
				continue
			}
			// No-op
			break
		// <Preformatted>
		case "`":
		case "~":
			if (testElements.PreformattedStart(each)) {
				const syntax = each.data.slice(0, 3)
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					if (testElements.PreformattedEnd(nodes[x2], syntax)) {
						// No-op; do not decrement
						break
					}
				}
				// Guard EOF:
				if (x2 === nodes.length) {
					// No-op
					break
				}
				const range = nodes.slice(x1, x2 + 1)
				const element = cacheStrategy(range, parsePreformatted)
				elements.push({
					...element,
					id: each.id,
					children: element.children.map((each, x) => ({
						...each,
						id: range[x].id,
					})),
				})
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
			if (testElements.AnyList(each)) {
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					if (!testElements.AnyList(nodes[x2])) {
						x2-- // One too many; decrement
						break
					}
				}
				const range = nodes.slice(x1, x2 + 1)
				const element = cacheStrategy(range, parseAnyList)

				// Recursively mutates IDs; does not mutate the root
				// ID on purpose.
				let y = 0
				const recurse = element => {
					for (let x = 0; x < element.children.length; x++) {
						// console.log(element.children[x].id, range[y].id)
						element.children[x].id = range[y].id
						if (element.children[x].type === typeEnum.AnyListItem || element.children[x].type === typeEnum.TodoItem) {
							y++ // Increment to the next node
							continue
						}
						recurse(element.children[x])
					}
				}
				recurse(element)

				elements.push({
					...element,
					id: each.id,
				})
				x1 = x2
				continue
			} else if (testElements.Break(each)) {
				const element = cacheStrategy(each, parseBreak)
				elements.push({
					...element,
					id: each.id,
				})
				continue
			}
			// No-op
			break

		// <Image>
		case "!":
		case "[":
			// ![Image](src) or [![Image](src)](href)
			//
			// https://regex101.com/r/FBKxEO/1
			let matches = null
			if (each.data[0] === "!") {
				matches = each.data.match(/^!\[([^]*)\]\(([^)]+)\)$/)
			// https://regex101.com/r/FBKxEO/2
			} else if (each.data[0] === "[") {
				matches = each.data.match(/^\[!\[([^]*)\]\(([^)]+)\)\]\(([^)]+)\)$/)
			}
			if (matches) {
				const [, alt, src, href] = matches
				const element = cacheStrategy(each, node => ({
					type: typeEnum.Image,
					id: each.id,
					syntax: !href ? ["![", `](${src})`] : ["[![", `](${src})](${href})`],
					src: src,
					alt: toInnerText(alt),
					href,
					children: parseInlineElements(alt),
				}))
				elements.push({
					...element,
					id: each.id,
				})
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
		elements.push({
			...element,
			id: each.id,
		})
	}
	return elements
}

export default parseElements
