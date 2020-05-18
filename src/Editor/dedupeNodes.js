import uuidv4 from "uuid/v4"

// Dedupes repeat-ID nodes.
function dedupeNodes(nodes) {
	// NOTE: Do not use [...nodes] because references are
	// shared
	const deduped = nodes.map(each => ({ ...each }))
	const seen = {}
	for (const each of deduped) {
		if (!each.id || seen[each.id]) {
			each.id = uuidv4()
		}
		seen[each.id] = true
	}
	return deduped
}

export default dedupeNodes
