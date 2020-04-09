import typeEnum from "./typeEnum"

// Parses a GitHub Flavored Markdown (GFM) data structure
// from an unparsed data structure. An unparsed data
// structure just represents keyed paragraphs.
//
// TODO: Memoize parsed
function parseGFM(unparsed) {
	const parsed = []
	for (const each of unparsed) {
		parsed.push({
			type: typeEnum.P,
			id: each.id,
			raw: each.raw,
			parsed: each.raw, // TODO
		})
	}
	return parsed
}

export default parseGFM
