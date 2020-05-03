import parseInlineElements from "./parseInlineElements"
import typeEnum from "../typeEnum"

/* eslint-disable no-multi-spaces, no-useless-escape */
export const TaskListRe      = /^(\t*)(- \[(?: |x)\] )/
export const UnorderedListRe = /^(\t*)([-*] )/
export const OrderedListRe   = /^(\t*)(\d+\. )/
/* eslint-enable no-multi-spaces, no-useless-escape */

// NOTE: TaskListRe takes precedence
export const AnyListRe = /^(\t*)(- \[(?: |x)\] |[-*] |\d+\. )/

// Parses a list-based VDOM representation from a range of
// paragraphs.
export function parseAnyList(range) {
	const result = {
		type: typeEnum.AnyList,
		tag: UnorderedListRe.test(range[0].data) ? "ul" : "ol",
		id: range[0].id,
		tabs: "",
		children: [],
	}
	for (const each of range) {
		const [, tabs, syntax] = each.data.match(AnyListRe)
		const substr = each.data.slice((tabs + syntax).length)
		let ref = result.children
		for (let x = 0; x < tabs.length; x++) {
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
		}
		let checked = -1
		if (syntax === "- [ ] " || syntax === "- [x] ") {
			checked = Number(syntax === "- [x] ")
		}
		ref.push({
			type: checked === -1 ? typeEnum.AnyListItem : typeEnum.TodoItem,
			tag: "li",
			id: each.id,
			tabs,
			syntax: [tabs + syntax],
			checked: checked === -1 ? undefined : Boolean(checked),
			children: parseInlineElements(substr),
		})
	}
	return result
}
