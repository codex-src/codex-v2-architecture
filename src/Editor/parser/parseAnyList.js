import parseInlineElements from "./parseInlineElements"
import typeEnum from "../typeEnum"

import {
	AnyListRe,
	UnorderedListRe,
} from "./spec"

// Parses a list-based VDOM representation from a range of
// paragraphs.
function parseAnyList(range) {
	const element = {
		type: typeEnum.AnyList,
		tag: UnorderedListRe.test(range[0].data) ? "ul" : "ol",
		id: range[0].id,
		children: [],
	}
	for (const each of range) {
		const [, tabs, syntax] = each.data.match(AnyListRe)
		const substr = each.data.slice((tabs + syntax).length)
		let ref = element.children
		for (let x = 0; x < tabs.length; x++) {
			if (!ref.length || ref[ref.length - 1].type !== typeEnum.AnyList) {
				ref.push({
					type: typeEnum.AnyList,
					tag: UnorderedListRe.test(each.data) ? "ul" : "ol",
					id: each.id,
					children: [],
				})
			}
			ref = ref[ref.length - 1].children
		}
		let checked = -1
		if (syntax === "- [ ] " || syntax === "- [x] ") {
			checked = Number(syntax === "- [x] ")
		}
		ref.push({
			type: checked === -1 ? typeEnum.AnyListItem : typeEnum.TodoItem,
			tag: "li",
			id: each.id,
			syntax: [tabs + syntax],
			checked: checked === -1 ? undefined : Boolean(checked),
			children: parseInlineElements(substr),
		})
	}
	return element
}

export default parseAnyList
