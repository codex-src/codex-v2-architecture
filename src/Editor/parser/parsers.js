import parseInlineElements from "./parseInlineElements"
import typeEnum from "../Elements/typeEnum"

// Parses a header element.
export function parseHeader(node) {
	const syntax = node.data.split(" ", 1)[0] + " " // eslint-disable-line prefer-template
	const element = {
		type: typeEnum.Header,
		tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
		id: node.id,
		syntax: [syntax],
		children: parseInlineElements(node.data.slice(syntax.length)),
	}
	return element
}

// Parses a paragraph element.
export function parseParagraph(node) {
	const children = parseInlineElements(node.data)
	const element = {
		type: typeEnum.Paragraph,
		id: node.id,
		emojis: (
			children &&
			children.every &&
			children.every(each => each && each.type && each.type === typeEnum.Emoji) &&
			children.length // Return the number of emojis
		),
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
		// Copy range to prevent Proxy error:
		//
		// Uncaught TypeError: Cannot perform 'ownKeys' on a
		// proxy that has been revoked
		children: range.map(each => ({ ...each })),
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
