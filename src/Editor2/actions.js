import parse from "./parser"

// Inserts a tab character.
//
// TODO: Add tests
function tab(state, setState) {
	const index = state.data.findIndex(each => each.id === state.pos1.id)
	const unparsed = state.data.slice(index, index + 1).map(each => ({
		...each,
		raw: `${each.raw.slice(0, state.pos1.offset)}\t${each.raw.slice(state.pos2.offset)}`,
	}))
	setState(current => ({
		...current,
		data: [...state.data.slice(0, index), ...parse(unparsed), ...state.data.slice(index + 1)],
		pos1: {
			...state.pos1,
			offset: state.pos1.offset + 1,
		},
		// Reset to pos1:
		pos2: {
			...state.pos1,
			offset: state.pos1.offset + 1,
		},
	}))
}

// Inserts many tab character, each at the start.
//
// TODO: Add tests
function tabMany(state, setState) {
	const index1 = state.data.findIndex(each => each.id === state.pos1.id)
	let index2 = index1
	if (state.pos2.id !== state.pos1.id) {
		index2 = state.data.findIndex(each => each.id === state.pos2.id)
	}
	const unparsed = state.data.slice(index1, index2 + 1).map(each => ({
		...each,
		raw: `\t${each.raw}`,
	}))
	setState(current => ({
		...current,
		data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
		pos1: {
			...state.pos1,
			offset: state.pos1.offset + 1,
		},
		pos2: {
			...state.pos2,
			offset: state.pos2.offset + 1,
		},
	}))
}

// Removes many tab character, each at the start.
//
// TODO: Add tests
function detabMany(state, setState) {
	const index1 = state.data.findIndex(each => each.id === state.pos1.id)
	let index2 = index1
	if (state.pos2.id !== state.pos1.id) {
		index2 = state.data.findIndex(each => each.id === state.pos2.id)
	}
	const unparsed = state.data.slice(index1, index2 + 1).map(each => ({
		...each,
		raw: each.raw.replace(/^\t/, ""),
	}))
	const removed1 = unparsed[0].raw.length !== state.data[index1].raw.length
	const removed2 = unparsed.slice(-1)[0].raw.length !== state.data[index2].raw.length
	setState(current => ({
		...current,
		data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
		pos1: {
			...state.pos1,
			// Guard state.pos1.offset bounds:
			offset: Math.max(0, state.pos1.offset - removed1),
		},
		pos2: {
			...state.pos2,
			// Guard state.pos2.offset bounds:
			offset: Math.max(0, state.pos2.offset - removed2),
		},
	}))
}

const actions = {
	// Logically sorted
	tab,
	tabMany,
	detabMany,
}

export default actions
