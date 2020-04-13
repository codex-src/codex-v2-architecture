import * as Types from "./__types"

// Constructor for a new cursor data structure.
export function newPos(): Types.Pos {
	const pos = {
		node: {
			id: "",
			offset: 0,
		},
		root: {
			id: "",
			offset: 0,
		},
	}
	return pos
}
