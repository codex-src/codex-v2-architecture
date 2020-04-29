import uuidv4 from "uuid/v4"

// Dedupes nodes e.g. repeat IDs.
function dedupeNodes(nodes) {
	// NOTE: [...nodes] (v. nodes.map) does not work because
	// references are shared
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
