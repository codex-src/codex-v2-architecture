// // Creates a new cursor data structure.
// function newPos() {
// 	const pos = {
// 		id: "",
// 		offset: 0,
// 	}
// 	return pos
// }

// Creates a new cursor data structure.
function newPos() {
	const pos = {
		root: {
			id: "",
			offset: 0,
		},
		node: {
			id: "",
			offset: 0,
		},
	}
	return pos
}

export default newPos
