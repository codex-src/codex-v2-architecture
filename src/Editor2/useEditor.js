import newPos from "./newPos"
import React from "react"
import typeEnum from "./typeEnum"
import uuidv4 from "uuid/v4"

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

function useEditor(initialValue, options = null) {
	const [state, setState] = React.useState(() => ({
		isFocused: false,    // Is focused?
		hasSelection: false, // Has a selection?
		data: parseGFM(initialValue.split("\n").map(each => ({
			id: uuidv4(),
			raw: each,
		}))),
		pos1: newPos(),
		pos2: newPos(),
	}))
	return [state, setState]
}

export default useEditor
