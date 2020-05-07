import parseAnyList from "./parseAnyList"
import parseInlineElements from "./parseInlineElements"
import typeEnum from "../Elements/typeEnum"
import { toInnerText } from "../Elements/cmap"

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

function testFastPass(char) {
	const ok = (
		(char >= "a" && char <= "z") || /* char !== "h" && */
		(char >= "A" && char <= "Z") ||
		char === " "
	)
	return ok
}

// Parses GitHub Flavored Markdown elements.
function parseElements(nodes, cachedElements) {
	const newURLHash = newURLHashEpoch()

	const cacheStrategy = (range, parseElement) => {
		return parseElement(range)

		// const key = !Array.isArray(range) ? range.data : range.map(each => each.data).join("\n")
		// let element = cachedElements.get(key)
		// if (!element) {
		// 	element = parseElement(range)
		// 	cachedElements.set(key, element)
		// }
		// return element
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
			if (testHeader(each)) {
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
			if (testBlockquote(each)) {
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					if (!testBlockquote(nodes[x2])) {
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
			if (testPreformattedStart(each)) {
				const syntax = each.data.slice(0, 3)
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					if (testPreformattedEnd(nodes[x2], syntax)) {
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
			if (testAnyList(each)) {
				let x2 = x1
				x2++
				for (; x2 < nodes.length; x2++) {
					if (!testAnyList(nodes[x2])) {
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
			} else if (testBreak(each)) {
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
