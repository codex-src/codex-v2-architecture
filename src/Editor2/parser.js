// // @flow
// import * as Types from "./__types"
import typeEnum from "./typeEnum"

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
function parse(unparsed /* : Types.UnparsedElements */) {
	// const parsed = []
	// for (const each of unparsed) {
	// 	parsed.push({
	// 		type: typeEnum.P,
	// 		id: each.id,
	// 		raw: each.raw,
	// 		parsed: each.raw, // TODO
	// 	})
	// }
	// return parsed

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
				(nchars >= 2 && each.raw.slice(0, 2) === "# ") ||
				(nchars >= 3 && each.raw.slice(0, 3) === "## ") ||
				(nchars >= 4 && each.raw.slice(0, 4) === "### ") ||
				(nchars >= 5 && each.raw.slice(0, 5) === "#### ") ||
				(nchars >= 6 && each.raw.slice(0, 6) === "##### ") ||
				(nchars >= 7 && each.raw.slice(0, 7) === "###### ")
			) {
				const syntax = each.raw.slice(0, each.raw.indexOf(" ") + 1)
				parsed.push({
					// type: Header,
					type: typeEnum.Header,
					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
					id: each.id,
					syntax: [syntax],
					// hash: newHash(toInnerString(parseInnerGFM(each.raw.slice(syntax.length)))),
					hash: "TODO",
					// children: parseInnerGFM(each.raw.slice(syntax.length)),
					raw: each.raw,
					parsed: each.raw.slice(syntax.length),
				})
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
			type: typeEnum.P,
			id: each.id,
			// emojis: (
			// 	children &&
			// 	children.every &&
			// 	children.every(each => each.type === E)
			// ),
			raw: each.raw,
			// children,
			parsed: each.raw,
		})
	}
	return parsed
}

// // Parses GFM text to a VDOM representation.
// export function parseGFM(text) {
// 	const newHash = newHashEpoch()
//
// 	const data = []
// 	const body = text.split("\n")
// 	for (let index = 0; index < body.length; index++) {
// 		const each = body[index]
// 		const char = each.charAt(0)
// 		const nchars = each.length
// 		switch (true) {
// 		// <Header>
// 		case char === "#":
// 			// # Header
// 			// ## Subheader
// 			// ### H3
// 			// #### H4
// 			// ##### H5
// 			// ###### H6
// 			if (
// 				(nchars >= 2 && each.slice(0, 2) === "# ") ||
// 				(nchars >= 3 && each.slice(0, 3) === "## ") ||
// 				(nchars >= 4 && each.slice(0, 4) === "### ") ||
// 				(nchars >= 5 && each.slice(0, 5) === "#### ") ||
// 				(nchars >= 6 && each.slice(0, 6) === "##### ") ||
// 				(nchars >= 7 && each.slice(0, 7) === "###### ")
// 			) {
// 				const syntax = each.slice(0, each.indexOf(" ") + 1)
// 				data.push({
// 					type: Header,
// 					tag: ["h1", "h2", "h3", "h4", "h5", "h6"][syntax.length - 2],
// 					id: uuidv4(),
// 					syntax: [syntax],
// 					hash: newHash(toInnerString(parseInnerGFM(each.slice(syntax.length)))),
// 					children: parseInnerGFM(each.slice(syntax.length)),
// 				})
// 				continue
// 			}
// 			break
// 		// <Blockquote>
// 		case char === ">":
// 			// > Blockquote
// 			if (
// 				(nchars >= 2 && each.slice(0, 2) === "> ") ||
// 				(nchars === 1 && each === ">")
// 			) {
// 				const x1 = index
// 				let x2 = x1
// 				x2++
// 				// Iterate to end syntax:
// 				while (x2 < body.length) {
// 					if (
// 						(body[x2].length < 2 || body[x2].slice(0, 2) !== "> ") &&
// 						(body[x2].length !== 1 || body[x2] !== ">")
// 					) {
// 						// No-op
// 						break
// 					}
// 					x2++
// 				}
// 				data.push({
// 					type: Blockquote,
// 					id: uuidv4(),
// 					children: body.slice(x1, x2).map(each => ({
// 						type: BquoteParagraph,
// 						id: uuidv4(),
// 						syntax: [each.slice(0, 2)],
// 						children: parseInnerGFM(each.slice(2)),
// 					})),
// 				})
// 				index = x2 - 1
// 				continue
// 			}
// 			break
// 		// <CodeBlock>
// 		case char === "`":
// 			// ```
// 			// Code block
// 			// ```
// 			if (
// 				nchars >= 3 &&
// 				each.slice(0, 3) === "```" &&
// 				each.slice(3).indexOf("`") === -1 && // Negate backticks
// 				index + 1 < body.length
// 			) {
// 				const x1 = index
// 				let x2 = x1
// 				x2++
// 				// Iterate to end syntax:
// 				while (x2 < body.length) {
// 					if (body[x2].length === 3 && body[x2] === "```") {
// 						// No-op
// 						break
// 					}
// 					x2++
// 				}
// 				if (x2 === body.length) { // Unterminated
// 					index = x1
// 					break
// 				}
// 				x2++ // Iterate once past end
// 				const info = each.slice(3)
// 				data.push({
// 					type: CodeBlock,
// 					id: uuidv4(),
// 					syntax: [body[x1], body[x2 - 1]],
// 					info,
// 					extension: info.split(".").slice(-1)[0].toLowerCase(),
// 					children: x1 + 1 === x2 - 1
// 						? ""
// 						: `${body.slice(x1 + 1, x2 - 1).join("\n")}\n`,
// 					// .slice(each.length, -3) // Trim syntax
// 					// .slice(1),              // Trim start paragraph
// 				})
// 				index = x2 - 1
// 				continue
// 			}
// 			break
// 		// <List>
// 		case char === "\t" || (
// 			(char === "-" || char === "+" || char === "*" || (char >= "0" && char <= "9")) &&
// 			(each !== "---" && each !== "***") // Negate break
// 		):
// 			// - List
// 			// 1. List
// 			if (nchars >= "- ".length && AnyListRe.test(each)) {
// 				const x1 = index
// 				let x2 = x1
// 				x2++
// 				// Iterate to end syntax:
// 				while (x2 < body.length) {
// 					if (body[x2].length < 2 || !AnyListRe.test(body[x2])) {
// 						// No-op
// 						break
// 					}
// 					x2++
// 				}
// 				const range = body.slice(x1, x2)
// 				data.push(parseList(range))
// 				index = x2 - 1
// 				continue
// 			}
// 			break
// 		// <Image>
// 		//
// 		// TODO: Move to parseInnerGFM to support
// 		// [![Image](href)](href) syntax?
// 		case char === "!":
// 			// ![Image](href)
// 			if (nchars >= "![](x)".length) {
// 				const lhs = registerType(null, "]")(each, "!".length, { minOffset: 0 })
// 				if (!lhs) {
// 					// No-op
// 					break
// 				}
// 				// Check ( syntax:
// 				if (lhs.x2 < nchars && each[lhs.x2] !== "(") {
// 					// No-op
// 					break
// 				}
// 				const rhs = registerType(null, ")", { recurse: false })(each, lhs.x2)
// 				if (!rhs) {
// 					// No-op
// 					break
// 				}
// 				data.push({
// 					type: Image,
// 					id: uuidv4(),
// 					// syntax: ["![", "](…)"],
// 					syntax: ["![", `](${rhs.data.children})`],
// 					src: rhs.data.children,
// 					alt: toInnerString(lhs.data.children),
// 					children: lhs.data.children,
// 				})
// 				continue
// 			}
// 			break
// 		// <Break>
// 		case char === "-" || char === "*":
// 			// ---
// 			// ***
// 			if (nchars === 3 && each === char.repeat(3)) {
// 				data.push({
// 					type: Break,
// 					id: uuidv4(),
// 					syntax: [each],
// 					children: null,
// 				})
// 				continue
// 			}
// 			break
// 		default:
// 			// No-op
// 			break
// 		}
// 		// <Paragraph>
// 		const children = parseInnerGFM(each)
// 		data.push({
// 			type: Paragraph,
// 			id: uuidv4(),
// 			emojis: (
// 				children &&
// 				children.every &&
// 				children.every(each => each.type === E)
// 			),
// 			children,
// 		})
// 	}
// 	return data
// }

export default parse
