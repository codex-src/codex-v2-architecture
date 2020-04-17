// Creates an extended node ID range.
function extendPosRange(state, [pos1, pos2]) {
	let y1 = pos1.y
	y1 -= 2
	if (y1 < 0) {
		y1 = 0
	}
	let y2 = pos2.y
	y2 += 2
	if (y2 >= state.nodes.length) {
		y2 = state.nodes.length - 1
	}
	return [state.nodes[y1].id, state.nodes[y2].id]
}

export default extendPosRange
