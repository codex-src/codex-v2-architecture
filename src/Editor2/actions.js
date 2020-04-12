import parse from "./parser"
import uuidv4 from "uuid/v4"

// // Inserts a tab character.
// function tab(state, setState) {
// 	const index = state.data.findIndex(each => each.id === state.pos1.id)
// 	const unparsed = state.data.slice(index, index + 1).map(each => ({
// 		...each,
// 		raw: `${each.raw.slice(0, state.pos1.offset)}\t${each.raw.slice(state.pos2.offset)}`,
// 	}))
// 	setState(current => ({
// 		...current,
// 		data: [...state.data.slice(0, index), ...parse(unparsed), ...state.data.slice(index + 1)],
// 		pos1: {
// 			...state.pos1,
// 			offset: state.pos1.offset + 1,
// 		},
// 		pos2: {
// 			...state.pos1,
// 			offset: state.pos1.offset + 1,
// 		},
// 	}))
// }
//
// // Inserts many tab character, each at the start.
// function tabMany(state, setState) {
// 	const index1 = state.data.findIndex(each => each.id === state.pos1.id)
// 	let index2 = index1
// 	if (state.pos2.id !== state.pos1.id) {
// 		index2 = state.data.findIndex(each => each.id === state.pos2.id)
// 	}
// 	const unparsed = state.data.slice(index1, index2 + 1).map(each => ({
// 		...each,
// 		raw: `\t${each.raw}`,
// 	}))
// 	setState(current => ({
// 		...current,
// 		data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
// 		pos1: {
// 			...state.pos1,
// 			offset: state.pos1.offset + 1,
// 		},
// 		pos2: {
// 			...state.pos2,
// 			offset: state.pos2.offset + 1,
// 		},
// 	}))
// }
//
// // Removes many tab character, each at the start.
// function detabMany(state, setState) {
// 	const index1 = state.data.findIndex(each => each.id === state.pos1.id)
// 	let index2 = index1
// 	if (state.pos2.id !== state.pos1.id) {
// 		index2 = state.data.findIndex(each => each.id === state.pos2.id)
// 	}
// 	const unparsed = state.data.slice(index1, index2 + 1).map(each => ({
// 		...each,
// 		raw: each.raw.replace(/^\t/, ""),
// 	}))
// 	const removed1 = unparsed[0].raw.length !== state.data[index1].raw.length
// 	const removed2 = unparsed.slice(-1)[0].raw.length !== state.data[index2].raw.length
// 	setState(current => ({
// 		...current,
// 		data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
// 		pos1: {
// 			...state.pos1,
// 			offset: Math.max(0, state.pos1.offset - removed1),
// 		},
// 		pos2: {
// 			...state.pos2,
// 			offset: Math.max(0, state.pos2.offset - removed2),
// 		},
// 	}))
// }

// Inserts an EOL character.
function enter(state, setState) {
	const x1 = state.data.findIndex(each => each.id === state.pos1.root.id)
	let x2 = x1
	if (state.pos2.root.id !== state.pos1.root.id) {
		x2 = state.data.findIndex(each => each.id === state.pos2.root.id)
	}
	const unparsed = [
		...state.data[x1].raw.slice(0, state.pos1.root.offset).split("\n").map((each, index) => ({
			id: !index ? state.data[x1].id : uuidv4(),
			raw: each,
		})),
		...state.data[x2].raw.slice(state.pos2.root.offset).split("\n").map((each, index) => ({
			id: !index && state.pos1.root.id !== state.pos2.root.id ? state.data[x2].id : uuidv4(),
			raw: each,
		})),
	]
	// console.log(unparsed[1].id)
	setState(current => ({
		...current,
		data: [...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)],
		pos1: {
			...state.pos1,
			root: {
				id: unparsed[1].id,
				offset: 0,
			},
		},
		// Collapse to pos1:
		pos2: {
			...state.pos1,
			root: {
				id: unparsed[1].id,
				offset: 0,
			},
		},
	}))

	// console.log([...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)])

	// const x1 = state.data.findIndex(each => each.id === state.pos1.root.id)
	// let x2 = x1
	// if (state.pos2.root.id !== state.pos1.root.id) {
	// 	x2 = state.data.findIndex(each => each.id === state.pos2.root.id)
	// }
	// // Create LHS:
	// const substr1 = state.data[x1].raw.slice(0, state.pos1.root.offset)
	// const lhs = substr1.split("\n").map((each, index) => ({
	// 	id:  uuidv4(),
	// 	raw: each,
	// }))
	// lhs[0].id = state.data[x1].id
	// // Create RHS:
	// const substr2 = state.data[x2].raw.slice(state.pos2.root.offset)
	// const rhs = substr2.split("\n").map((each, index) => ({
	// 	id:  uuidv4(),
	// 	raw: each,
	// }))
	// rhs[rhs.length - 1].id = state.data[x2].id
	// // Set state:
	// setState(current => ({
	// 	...current,
	// 	data: [...state.data.slice(0, x1), ...parse([lhs, rhs]), ...state.data.slice(x2 + 1)],
	// 	pos1: {
	// 		...state.pos1,
	// 		root: {
	// 			id: lhs[0].id,
	// 			offset: 0,
	// 		},
	// 	},
	// 	pos2: {
	// 		...state.pos1,
	// 		root: {
	// 			id: lhs[0].id,
	// 			offset: 0,
	// 		},
	// 	},
	// }))

	// const unparsed =
	// state.data[startIndex].raw.slice(0, state.pos1.root.offset),
	// state.data[endIndex].raw.slice(state.pos2.root.offset)

	// const startIndex = state.data.findIndex(each => each.id === state.pos1.root.id)
	// let endIndex = startIndex
	// if (state.pos2.root.id !== state.pos1.root.id) {
	// 	endIndex = state.data.findIndex(each => each.id === state.pos2.root.id)
	// }
	// // TODO: Fixme for compound components?
	// const unparsed = [
	// 	{
	// 		id:  state.data[startIndex].id,
	// 		raw: state.data[startIndex].raw.slice(0, state.pos1.root.offset),
	// 	},
	// 	{
	// 		id:  state.pos1.root.id === state.pos2.root.id ? uuidv4() : state.data[endIndex].id,
	// 		raw: state.data[endIndex].raw.slice(state.pos2.root.offset),
	// 	},
	// ]
	// const { id } = unparsed.slice(-1)[0]
	// setState(current => ({
	// 	...current,
	// 	data: [...state.data.slice(0, startIndex), ...parse(unparsed), ...state.data.slice(endIndex + 1)],
	// 	pos1: {
	// 		...state.pos,
	// 		root: { id, offset: 0 },
	// 	},
	// 	pos2: {
	// 		...state.pos,
	// 		root: { id, offset: 0 },
	// 	},
	// }))
}

function input(state, setState) {
	// const index1 = state.data.findIndex(each => each.id === unparsed[0].id)
	// if (index1 === -1) {
	// 	throw new Error("onInput: unparsed[0].id is out of bounds")
	// }
	// const index2 = state.data.findIndex(each => each.id === unparsed.slice(-1)[0].id)
	// if (index2 === -1) {
	// 	throw new Error("onInput: unparsed.slice(-1)[0].id is out of bounds")
	// }
	// const unparsed = readRootIDs(editorRootRef.current, extendedIDsRef.current)
	// setState(current => ({
	// 	...current,
	// 	data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
	// }))
}

const actions = { // Lsorted
	// tab,
	// tabMany,
	// detabMany,
	enter,
	// input,
}

export default actions
