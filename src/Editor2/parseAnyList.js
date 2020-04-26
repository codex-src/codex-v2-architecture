import typeEnum from "./typeEnum"
import { parseInlineElements } from "./parser"

/* eslint-disable no-multi-spaces, no-useless-escape */
export const AnyListRe       = /^(\t*)(- \[(?: |x)\] |[\-\*] |\d+\. )/
export const UnorderedListRe = /^(\t*)([\-\*] )/
/* eslint-enable no-multi-spaces, no-useless-escape */

// Parses a list-based VDOM representation from a range of
// paragraphs.
export function parseAnyList(range) {
	const result = {
		type: typeEnum.AnyList,
		tag: UnorderedListRe.test(range[0].data) ? "ul" : "ol",
		id: range[0].id,
		tabs: 0,
		children: [],
	}
	for (const each of range) {
		const [, tabs, syntax] = each.data.match(AnyListRe)
		const substr = each.data.slice((tabs + syntax).length)
		let ref = result.children
		let x = ""
		while (x < tabs.length) {
			if (!ref.length || ref[ref.length - 1].type !== typeEnum.AnyList) {
				ref.push({
					type: typeEnum.AnyList,
					tag: UnorderedListRe.test(each.data) ? "ul" : "ol",
					id: each.id,
					tabs: "\t".repeat(x + 1), // Eagerly increment
					children: [],
				})
			}
			ref = ref[ref.length - 1].children
			x++
		}
		// let checked = null
		// if (syntax.endsWith("- [ ] ") || syntax.endsWith("- [x] ")) { // TODO: Use slice?
		// 	const value = syntax[syntax.length - 3] === "x"
		// 	checked = { value }
		// }
		ref.push({
			// type: !checked ? AnyListItem : TodoItem,
			type: typeEnum.AnyListItem,
			tag: "li",
			id: each.id,
			syntax: [syntax],
			tabs,
			// checked,
			children: parseInlineElements(substr),
		})
	}
	return result
}
