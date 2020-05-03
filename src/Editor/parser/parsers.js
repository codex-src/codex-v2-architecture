import parseInlineElements from "./parseInlineElements"
import typeEnum from "../typeEnum"

// Parses a header element.
//
// TODO: Add hash
export function parseHeader(node) {
	const syntax = node.data.split(" ", 1)[0] + " " // eslint-disable-line prefer-template
	const element = {
		type: typeEnum.Header,
		tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
		id: node.id,
		syntax: [syntax],
		// hash: newHash(toInnerText(parseInlineElements(node.data.slice(syntax.length)))),
		hash: "TODO",
		children: parseInlineElements(node.data.slice(syntax.length)),
	}
	return element
}

// Counts the number of emojis.
function countEmojis(children) {
	if (!children || !children.reduce) {
		return 0
	}
	const range = children.slice(0, 3)
	return range.reduce((count, each) => count + Number(each && each.type && each.type === typeEnum.Emoji), 0)
}

// Parses a paragraph element.
export function parseParagraph(node) {
	const children = parseInlineElements(node.data)
	const element = {
		type: typeEnum.Paragraph,
		id: node.id,
		// TODO: Rename to numberOfEmojis or emojiCount?
		emojis: countEmojis(children),
		children,
	}
	return element
}

// Parses a blockquote element.
export function parseBlockquote(range) {
	const element = {
		type: typeEnum.Blockquote,
		id: range[0].id,
		children: range.map(each => ({
			type: typeEnum.BlockquoteItem,
			id: each.id,
			syntax: [each.data.slice(0, 2)],
			children: parseInlineElements(each.data.slice(2)),
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
export function parsePreformatted(range) {
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
export function parseBreak(node) {
	const element = {
		type: typeEnum.Break,
		id: node.id,
		syntax: [node.data],
		children: null,
	}
	return element
}
