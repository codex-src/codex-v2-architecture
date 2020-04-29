import typeEnum from "./typeEnum"
import { parseInlineElements } from "./parser"

/* eslint-disable no-multi-spaces, no-useless-escape */
export const AnyListRe       = /^(\t*)(- \[(?: |x)\] |[\-\*] |\d+\. )/
export const UnorderedListRe = /^(\t*)([\-\*] )/
/* eslint-enable no-multi-spaces, no-useless-escape */

// Parses a list-based VDOM representation from a range of
// paragraphs.
export function parseAnyList(range) {
	let tag = UnorderedListRe.test(range[0].data) ? "ul" : "ol"
	const result = {
		type: typeEnum.AnyList,
		tag,
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
				tag = UnorderedListRe.test(each.data) ? "ul" : "ol"
				ref.push({
					type: typeEnum.AnyList,
					tag,
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
			syntax: [syntax],
			checked: checked === -1 ? undefined : Boolean(checked),
			children: parseInlineElements(substr),
		})
	}
	return result
}

// function parseList(range) {
// 	let tag = !NumberedListRe.test(range[0]) ? "ul" : "ol"
// 	const data = {
// 		type: List,
// 		tag,
// 		id: uuidv4(),
// 		children: [],
// 	}
// 	for (const each of range) {
// 		const [syntax] = each.match(AnyListRe)
// 		const substr = each.slice(syntax.length)
// 		let ref = data.children
// 		let deep = 0
// 		const depth = syntax.search(/[^\t]/)
// 		while (deep < depth) {
// 			if (!ref.length || ref[ref.length - 1].type !== List) {
// 				tag = !NumberedListRe.test(each) ? "ul" : "ol"
// 				ref.push({
// 					type: List,
// 					tag,
// 					id: uuidv4(),
// 					children: [],
// 				})
// 			}
// 			ref = ref[ref.length - 1].children
// 			deep++
// 		}
// 		let checked = null
// 		if (syntax.endsWith("- [ ] ") || syntax.endsWith("- [x] ")) {
// 			const value = syntax[syntax.length - 3] === "x"
// 			checked = { value }
// 		}
// 		ref.push({
// 			type: !checked ? ListItem : TodoItem,
// 			tag,
// 			id: uuidv4(),
// 			syntax: [syntax],
// 			checked,
// 			children: parseInnerGFM(substr),
// 		})
// 	}
// 	return data
// }
