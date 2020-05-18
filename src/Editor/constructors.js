import uuidv4 from "uuid/v4"

// Creates a new VDOM cursor data structure.
export function newPos() {
	const pos = {
		x: 0,
		y: 0,
		pos: 0,
	}
	return pos
}

// Creates a new DOM cursor data structure.
export function newRange() {
	const range = {
		node: null,
		offset: 0,
	}
	return range
}

// Creates a new nodes data structure.
//
// TODO: Add version property?
export function newNodes(data) {
	const nodes = data.split("\n").map(each => ({
		id: uuidv4(),
		data: each,
	}))
	return nodes
}
