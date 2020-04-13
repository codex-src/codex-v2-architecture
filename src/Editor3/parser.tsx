import * as Types from "./__types"
import TypeEnum from "./TypeEnum"

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
function parse(unparsed: Types.UnparsedElement[]): Types.ParsedElement[] /* Needed? */ {
	const parsed = []
	for (let x = 0; x < unparsed.length; x++) {
		const each = unparsed[x]
		const char = each.raw.charAt(0)
		const nchars = each.raw.length
		switch (true) {
		// <Header>
		case char === "#":
			// # Header
			// ## Subheader
			// ### H3
			// #### H4
			// ##### H5
			// ###### H6
			if (
				(nchars >= 2 && each.raw.startsWith("# ")) ||
				(nchars >= 3 && each.raw.startsWith("## ")) ||
				(nchars >= 4 && each.raw.startsWith("### ")) ||
				(nchars >= 5 && each.raw.startsWith("#### ")) ||
				(nchars >= 6 && each.raw.startsWith("##### ")) ||
				(nchars >= 7 && each.raw.startsWith("###### "))
			) {
				const syntax = each.raw.slice(0, each.raw.indexOf(" ") + 1)
				parsed.push({
					type: TypeEnum.Header,
					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
					id: each.id,
					syntax: [syntax],
					// hash: newHash(toInnerString(parseInnerGFM(each.raw.slice(syntax.length)))),
					hash: "TODO",
					// children: parseInnerGFM(each.raw.slice(syntax.length)),
					raw: each.raw,
					parsed: each.raw.slice(syntax.length),
				} as Types.HeaderElement)
				continue
			}
			break
		default:
			// No-op
			break
		}
		// <Paragraph>
		// const children = parseInnerGFM(each)
		parsed.push({
			type: TypeEnum.Paragraph,
			id: each.id,
			// emojis: (
			// 	children &&
			// 	children.every &&
			// 	children.every(each => each.type === E)
			// ),
			raw: each.raw,
			// children,
			parsed: each.raw,
		} as Types.ParagraphElement)
	}
	return parsed
}

export default parse
