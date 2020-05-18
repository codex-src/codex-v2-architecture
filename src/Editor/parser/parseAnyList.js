import parseInlineElements from "./parseInlineElements"
import typeEnum from "../Elements/typeEnum"
import { AnyListRe } from "./spec"

// Parses metadata for an <AnyList> element.
function parseMetadata(node) {
	const matches = node.data.match(AnyListRe)
	if (!matches) {
		return null
	}
	const [, , syntax] = matches
	switch (syntax[0]) {
	case "-":
	case "*":
		if (syntax === "- [ ] " || syntax === "- [x] ") { // Takes precedence
			const metadata = {
				matches,
				parent: {
					type: typeEnum.AnyList,
					tag: "ul",
					id: node.id,
				},
				type: typeEnum.TodoItem,
				tag: "li",
				id: node.id,
				checked: syntax === "- [x] ",
				ordered: undefined,
			}
			return metadata
		} else {
			const metadata = {
				matches,
				parent: {
					type: typeEnum.AnyList,
					tag: "ul",
					id: node.id,
				},
				type: typeEnum.AnyListItem,
				tag: "li",
				id: node.id,
				checked: undefined,
				ordered: false,
			}
			return metadata
		}
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
		const metadata = {
			matches,
			parent: {
				type: typeEnum.AnyList,
				tag: "ol",
				id: node.id,
			},
			type: typeEnum.AnyListItem,
			tag: "li",
			id: node.id,
			checked: undefined,
			ordered: true,
		}
		return metadata
	default:
		// No-op
		break
	}
	return null
}

// Parses an <AnyList> element.
function parseAnyList(range) {
	const { parent } = parseMetadata(range[0])
	const element = {
		...parent,
		children: [],
	}
	for (const each of range) {
		const { matches, parent, ...etc } = parseMetadata(each)
		const [, tabs, syntax] = matches
		let ref = element.children
		for (let x = 0; x < tabs.length; x++) {
			if (!ref.length || ref[ref.length - 1].type !== typeEnum.AnyList) {
				ref.push({
					...parent,
					children: [],
				})
			}
			ref = ref[ref.length - 1].children
		}
		ref.push({
			...etc,
			syntax: [tabs + syntax],
			children: parseInlineElements(each.data.slice((tabs + syntax).length)),
		})
	}
	return element
}

export default parseAnyList
