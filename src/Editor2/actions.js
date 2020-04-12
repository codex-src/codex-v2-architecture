// import readRoots from "./readRoots"
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

// // Inputs character data
// function input(state, setState, { roots: [root1, root2], root2AtEnd }) {
// 	const x1 = state.data.findIndex(each => each.id === root1.id)
// 	if (x1 === -1) {
// 		throw new Error("onInput: x1 out of bounds")
// 	}
// 	const x2 = !root2AtEnd ? state.data.findIndex(each => each.id === root2.id) : state.data.length - 1
// 	if (x2 === -1) {
// 		throw new Error("onInput: x2 out of bounds")
// 	}
// 	const unparsed = readRoots(ref.current, [root1, root2])
// 	const [pos1, pos2] = computePosRange(ref.current)
// 	setState(current => ({ // FIXME: Use current
// 		...current,
// 		data: [...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)],
// 		pos1,
// 		pos2,
// 		// NOTE: Do not extendPosRange here; defer
// 		// to end of useLayoutEffect
// 	}))
// }

const actions = {
	enter,
	// input,
}

export default actions
