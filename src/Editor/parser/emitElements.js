import emitAnyList from "./emitAnyList"
import parseInlineElements from "./parseInlineElements"
import typeEnum from "../Elements/typeEnum"

// Gets header metadata.
function getHeaderInfo(node) {
	const [hashes] = node.data.split(" ", 1)
	const metadata = {
		syntax: `${hashes} `,
		tag: `h${hashes.length}`,
	}
	return metadata
}

// Gets preformatted metadata.
function getPreformattedMetadata(node) {
	// TODO: Rename to infoString?
	//
	// https://github.github.com/gfm/#info-string
	const info = node.data.slice(3)
	const metadata = {
		info,
		extension: info.split(".").slice(-1)[0].toLowerCase(),
	}
	return metadata
}

// *type
// *id
// *children
//
// TODO: Add emitElements.Image
const emitElements = {
	// +tag (needed for cmap)
	// +syntax
	Header(node) {
		const metadata = getHeaderInfo(node)
		const element = {
			type: typeEnum.Header,
			tag: metadata.tag, // cmap
			id: node.id,
			syntax: [metadata.syntax],
			children: parseInlineElements(node.data.slice(metadata.syntax.length)),
		}
		return element
	},
	Paragraph(node) {
		const element = {
			type: typeEnum.Paragraph,
			id: node.id,
			children: parseInlineElements(node.data),
		}
		return element
	},
	// +children.syntax
	Blockquote(range) {
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
	},
	// +syntax
	// +info
	// +extension
	Preformatted(range) {
		const metadata = getPreformattedMetadata(range[0])
		const element = {
			type: typeEnum.Preformatted,
			id: range[0].id,
			syntax: [range[0].data, range[range.length - 1].data],
			info: metadata.info,
			extension: metadata.extension,
			// Copy range to prevent Proxy error:
			//
			// Uncaught TypeError: Cannot perform 'ownKeys' on a
			// proxy that has been revoked
			children: range.map(each => ({ ...each })),
		}
		return element
	},
	AnyList(range) {
		return emitAnyList(range)
	},
	// +syntax
	// -children
	Break(node) {
		const element = {
			type: typeEnum.Break,
			id: node.id,
			syntax: [node.data],
		}
		return element
	},
}

export default emitElements
