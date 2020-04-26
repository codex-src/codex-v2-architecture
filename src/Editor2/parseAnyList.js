import typeEnum from "./typeEnum"
import { parseInlineElements } from "./parser"

/* eslint-disable no-multi-spaces, no-useless-escape */
export const AnyListRe     = /^\t*(?:- \[( |x)\] |[\-\+\*] |\d+\. )/
export const OrderedListRe = /^\t*\d+\. /
/* eslint-enable no-multi-spaces, no-useless-escape */

// Parses a list-based VDOM representation from a range of
// paragraphs.
export function parseAnyList(range) {
	let tag = !OrderedListRe.test(range[0]) ? "ul" : "ol"
	const result = {
		type: typeEnum.AnyList,
		tag,
		id: range[0].id,
		children: [],
	}
	for (const each of range) {
		const [syntax] = each.data.match(AnyListRe)
		const substr = each.data.slice(syntax.length)
		let ref = result.children
		let deep = 0
		const depth = syntax.search(/[^\t]/)
		while (deep < depth) {
			if (!ref.length || ref[ref.length - 1].type !== typeEnum.AnyList) {
				tag = !OrderedListRe.test(each.data) ? "ul" : "ol"
				ref.push({
					type: typeEnum.AnyList,
					tag,
					id: each.id,
					children: [],
				})
			}
			ref = ref[ref.length - 1].children
			deep++
		}
		// let checked = null
		// if (syntax.endsWith("- [ ] ") || syntax.endsWith("- [x] ")) {
		// 	const value = syntax[syntax.length - 3] === "x"
		// 	checked = { value }
		// }
		ref.push({
			// type: !checked ? AnyListItem : TodoItem,
			type: typeEnum.AnyListItem,
			tag,
			id: each.id,
			syntax: [syntax],
			// checked,
			children: parseInlineElements(substr),
		})
	}
	return result
}
