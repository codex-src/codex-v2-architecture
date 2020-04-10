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

export default newPos
