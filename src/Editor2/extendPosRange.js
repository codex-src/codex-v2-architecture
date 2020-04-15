// Creates an extended cursor ID (root ID) range.
function extendPosRange(state, [pos1, pos2]) {
	let x1 = state.data.findIndex(each => each.id === pos1.root.id)
	x1 -= 2
	if (x1 < 0) {
		x1 = 0
	}
	let x2 = state.data.findIndex(each => each.id === pos2.root.id)
	x2 += 2
	if (x2 >= state.data.length) {
		x2 = state.data.length - 1
	}
	return [state.data[x1].id, state.data[x2].id]
}

export default extendPosRange
