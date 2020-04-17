import uuidv4 from "uuid/v4"

// Creates a new cursor data structure.
export function newPos() {
	const pos = {
		x: 0,   // The x-axis offset
		y: 0,   // The y-axis offset
		pos: 0, // The absolute position (pos: position)
	}
	return pos
}

// Creates a new document nodes data structure.
export function newNodes(str) {
	const doc = str.split("\n").map(each => ({
		id: uuidv4(),
		data: each,
	}))
	return doc
}
