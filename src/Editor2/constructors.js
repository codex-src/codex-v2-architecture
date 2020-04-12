// @flow
import PosType from "./__types"

// Creates a new cursor data structure.
export function newPos(): PosType {
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
