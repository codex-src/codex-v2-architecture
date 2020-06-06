import emitElements from "./emitElements"
import newCacheStrategy from "./newCacheStrategy"
import newURLHashEpoch from "./newURLHashEpoch"
import testElements from "./testElements"
import typeEnum from "../Elements/typeEnum"
import { toInnerText } from "../Elements/cmap"

import {
	StrictImageRegex,
	StrictLinkedImageRegex,
} from "../regexes"

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

// Parses GitHub Flavored Markdown elements.
function parseElements(nodes, cachedElements) {
	// const cacheStrategy = newCacheStrategy(cachedElements)
	const newURLHash = newURLHashEpoch()

	const elements = []
	for (let x1 = 0, len = nodes.length; x1 < len; x1++) {
		const each = nodes[x1]
		const char = each.data.slice(0, 1)

		// Fast pass:
		if (!char || testFastPass(char)) {
			// const element = cacheStrategy(each, emitElements.Paragraph)
			// elements.push({
			// 	// ...element,
			// 	...emitElements.Paragraph(element),
			// 	id: each.id,
			// })
			const element = emitElements.Paragraph(each)
			elements.push(element)
			continue
		}

		switch (char) {
		// <Header>
		case "#":
			if (testElements.Header(each)) {
				// const element = cacheStrategy(each, each => emitElements.Header(each))
				// elements.push({
				// 	...element,
				// 	id: each.id,
				// 	hash: newURLHash(toInnerText(element.children)),
				// })
				const element = emitElements.Paragraph(each) // TODO: Move newURLHash to emitElements.Paragraph
				elements.push({
					...element,
					hash: newURLHash(toInnerText(element.children)),
				})
				continue
			}
			// No-op
			break
		// <Blockquote>
		case ">":
			// if (testElements.BlockquoteEdge(each)) {
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
				// const element = cacheStrategy(range, emitElements.Blockquote)
				const element = emitElements.Blockquote(range)
				elements.push(element)
				// elements.push({
				// 	...element,
				// 	id: each.id,
				// 	children: element.children.map((each, x) => ({
				// 		...each,
				// 		id: range[x].id,
				// 	})),
				// })
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
				// const element = cacheStrategy(range, emitElements.Preformatted)
				const element = emitElements.Preformatted(range)
				elements.push(element)
				// elements.push({
				// 	...element,
				// 	id: each.id,
				// 	children: element.children.map((each, x) => ({
				// 		...each,
				// 		id: range[x].id,
				// 	})),
				// })
				x1 = x2
				continue
			}
			// No-op
			break
		// <AnyList> or <Break>
		case "\t":
		case "-": // <Break>
		case "*": // <Break>
		case "_": // <Break>
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
				// const element = cacheStrategy(range, emitElements.AnyList)
				const element = emitElements.AnyList(range)

				// // Recursively mutates <AnyList> IDs.
				// let y = 0
				// const mutateAnyListIDs = element => {
				// 	for (let x = 0; x < element.children.length; x++) {
				// 		element.children[x].id = range[y].id
				// 		if (element.children[x].type === typeEnum.AnyListItem || element.children[x].type === typeEnum.TodoItem) {
				// 			y++
				// 			continue
				// 		}
				// 		mutateAnyListIDs(element.children[x])
				// 	}
				// }
				// mutateAnyListIDs(element)

				elements.push(element)
				// elements.push({
				// 	...element,
				// 	id: each.id,
				// })
				x1 = x2
				continue
			} else if (testElements.Break(each)) {
				// const element = cacheStrategy(each, emitElements.Break)
				const element = emitElements.Break(each)
				elements.push(element)
				// elements.push({
				// 	...element,
				// 	id: each.id,
				// })
				continue
			}
			// No-op
			break
		// <Image>
		case "!":
		case "[":
			// ![Image](src) or [![Image](src)](href)
			let matches = null
			if (char === "!") {
				matches = each.data.match(StrictImageRegex)
			} else if (char === "[") {
				matches = each.data.match(StrictLinkedImageRegex)
			}
			if (matches) {
				const [, alt, src, href] = matches
				// const element = cacheStrategy(each, node => emitElements.Image(node, { alt, src, href }))
				const element = emitElements.Image(each, { alt, src, href })
				elements.push(element)
				// elements.push({
				// 	...element,
				// 	id: each.id,
				// })
				continue
			}
			// No-op
			break
		default:
			// No-op
			break
		}

		// <Paragraph>
		// const element = cacheStrategy(each, emitElements.Paragraph)
		const element = emitElements.Paragraph(each)
		elements.push(element)
		// elements.push({
		// 	...element,
		// 	id: each.id,
		// })
	}
	console.log(elements)
	return elements
}

export default parseElements
