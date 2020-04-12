import parse from "./parser"
import uuidv4 from "uuid/v4"

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
		pos2: {
			...state.pos1,
			root: {
				id: unparsed[1].id,
				offset: 0,
			},
		},
	}))
}

const actions = {
	enter,
}

export default actions
