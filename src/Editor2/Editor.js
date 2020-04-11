// import actions from "./actions"
// import KeyCodes from "./KeyCodes"
import EditorContext from "./EditorContext"
import newPos from "./newPos"
import parse from "./parser"
import React from "react"
import ReactDOM from "react-dom"
import syncPosRoots from "./syncPosRoots"
import syncRoots from "./syncRoots"
import typeMap from "./typeMap"
import uuidv4 from "uuid/v4"

const DEBUG_MODE = true && process.env.NODE_ENV !== "production"

// Counts the offset from an element to a node.
function countOffset(element, node) {
	let offset = 0
	const recurse = any => {
		if (any === node) {
			return true
		}
		for (const each of any.childNodes) {
			if (recurse(each)) {
				return true
			}
			offset += (node.nodeValue || "").length
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				offset++
			}
		}
		return false
	}
	recurse(element)
	return offset
}

// Computes a cursor data structure from a range data
// structure.
function computePos(editorRoot, { ...range }) {
	if (!range.node || !editorRoot.contains(range.node)) {
		throw new Error("computePos: no such node or out of bounds")
	}
	const pos = newPos()
	// Iterate range.node to the deepest node:
	while (range.node.nodeType === Node.ELEMENT_NODE && range.node.childNodes.length) {
		range.node = range.node.childNodes[range.offset]
		range.offset = 0
	}
	// Compute pos.node.id; ascend to the nearest data-node or
	// data-root element:
	let node = range.node // eslint-disable-line prefer-destructuring
	while (!(node.getAttribute && (node.getAttribute("data-node") || node.getAttribute("data-root")))) {
		node = node.parentElement
	}
	pos.node.id = node.id
	// Compute pos.root.id:; ascend to the nearest data-root
	// element:
	let root = node
	while (!(root.getAttribute && root.getAttribute("data-root"))) {
		root = root.parentElement
	}
	pos.root.id = root.id
	// Compute the offset from node and root to range.node:
	pos.node.offset = countOffset(node, range.node) + range.offset
	pos.root.offset = countOffset(root, range.node) + range.offset
	// Done:
	return pos
}

// Computes cursor data structures.
function computePosRange(editorRoot) {
	const range = document.getSelection().getRangeAt(0)
	const rangeStart = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePos(editorRoot, rangeStart)
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		const rangeEnd = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePos(editorRoot, rangeEnd)
	}
	return [pos1, pos2]
}

// Creates an extended cursor ID (root ID) range.
function extendRootPostRange(data, [rootPos1, rootPos2]) {
	let index1 = data.findIndex(each => each.id === rootPos1.id)
	index1 -= 2 // Decrement 2x
	// Guard bounds:
	if (index1 < 0) {
		index1 = 0
	}
	let index2 = data.findIndex(each => each.id === rootPos2.id)
	index2 += 2 // Increment 2x
	// Guard bounds:
	if (index2 >= data.length) {
		index2 = data.length - 1
	}
	return [data[index1].id, data[index2].id]
}

// // Creates an extended cursor ID (root ID) range.
// function extendRootPostRange(data, [pos1, pos2]) {
// 	// const posRangeInfo = {
// 	// 	pos1: {
// 	// 		id: "",     // The ID
// 	// 		toStart: 0, // The number of IDs to the start
// 	// 	},
// 	// 	pos2: {
// 	// 		id: ""      // The ID
// 	// 		toEnd: 0,   // The number of IDs to the end
// 	// 	},
// 	// }
// 	let index1 = data.findIndex(each => each.id === pos1.root.id)
// 	index1 -= 2 // Decrement 2x
// 	// Guard bounds:
// 	if (index1 < 0) {
// 		index1 = 0
// 	}
// 	let index2 = data.findIndex(each => each.id === pos2.root.id)
// 	index2 += 2 // Increment 2x
// 	// Guard bounds:
// 	if (index2 >= data.length) {
// 		index2 = data.length - 1
// 	}
// 	return [data[index1].id, data[index2].id]
// }

// Reads a data-root element.
function readRoot(root) {
	const unparsed = [
		{
			id: root.id,
			raw: "",
		},
	]
	const recurse = any => {
		if (any.nodeType === Node.TEXT_NODE) {
			unparsed[unparsed.length - 1].raw += any.nodeValue
			return
		}
		for (const each of any.childNodes) {
			recurse(each)
			const next = each.nextElementSibling
			if (next && next.getAttribute("data-node")) {
				unparsed.push({
					id: next.id,
					raw: "",
				})
			}
		}
	}
	recurse(root)
	return unparsed
}

// Reads a range of data-root elements.
function readRoots(editorRoot, [startRoot, endRoot]) {
	const unparsed = []
	const seen = {}
	while (startRoot) {
		// Guard repeat IDs:
		if (!startRoot.id || seen[startRoot.id]) {
			startRoot.id = uuidv4()
		}
		seen[startRoot.id] = true
		unparsed.push(...readRoot(startRoot))
		if (startRoot === endRoot) {
			// No-op
			break
		}
		startRoot = startRoot.nextElementSibling
	}
	return unparsed
}

// Queries root elements for a cursor ID (root ID) range.
function queryRoots(editorRoot, [startID, endID]) {
	// Get the start root:
	const startRoot = document.getElementById(startID)
	if (!startRoot || !editorRoot.contains(startRoot)) {
		throw new Error(`readRoots: no such id=${startID || ""} or out of bounds`)
	}
	// Get the end root:
	const endRoot = document.getElementById(endID)
	if (!endRoot || !editorRoot.contains(endRoot)) {
		throw new Error(`readRoots: no such id=${endID || ""} or out of bounds`)
	}
	// // When next has no ID or a repeat ID, extend endRoot,
	// // correct the ID, and set atEnd to true:
	// let atEnd = false
	// const next = endRoot.nextElementSibling
	// if (next && next.getAttribute("data-root") && (!next.id || next.id === endRoot.id)) {
	// 	// alert("test")
	// 	endRoot = next
	// 	endRoot.id = uuidv4()
	// 	atEnd	= true
	// }
	// return { roots: [startRoot, endRoot], atEnd }
	return { roots: [startRoot, endRoot] /* , atEnd */ }
}

const Document = ({ data }) => (
	data.map(({ type: T, ...props }) => (
		React.createElement(typeMap[T], {
			key: props.id,
			...props,
		})
	))
)

;(() => {
	document.body.classList.toggle("debug-css")
})()

const Editor = ({ id, tag, state, setState }) => {
	const ref = React.useRef()

	const isPointerDownRef = React.useRef()

	// Renders to the DOM.
	React.useLayoutEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document data={state.data} />, state.reactDOM, () => {
				// Sync the React and user DOMs:
				const mutations = syncRoots(state.reactDOM, ref.current) // TODO: Rename to syncRoots
				if (!mutations) {
					// // No-op
					// return

					// Update extRootPosRange for edge-cases such as
					// forward-backspace:
					if (!state.focused) {
						// No-op
						return
					}
					const [pos1, pos2] = computePosRange(ref.current)
					const extRootPosRange = extendRootPostRange(state.data, [pos1.root, pos2.root])
					setState(current => ({
						...current,
						pos1,
						pos2,
						extRootPosRange,
					}))
					return
				}
				const posRoots = [state.pos1.root, state.pos2.root]
				if (posRoots.every(each => !each.id)) {
					// No-op
					return
				}
				// Sync the DOM and VDOM cursors:
				syncPosRoots(ref.current, posRoots)
				console.log("synced pos")
			})
		}, [state, setState]),
		[state.data],
	)

	// TODO: Register props e.g. readOnly
	const { Provider } = EditorContext
	return (
		<Provider value={[state, setState]}>
			<div>

				{React.createElement(
					tag || "div",
					{
						ref,

						id,

						style: {
							// NOTE: Imperative styles needed because of
							// contenteditable
							whiteSpace: "pre-wrap",
							outline: "none",
							overflowWrap: "break-word",
						},

						onFocus: () => setState(current => ({ ...current, focused: true })),
						onBlur:  () => setState(current => ({ ...current, focused: false })),

						onSelect: () => {
							// Guard out of bounds range:
							const selection = document.getSelection()
							if (!selection.rangeCount) {
								// No-op
								return
							}
							const range = selection.getRangeAt(0)
							if (range.startContainer === ref.current || range.endContainer === ref.current) {
								// Iterate to the deepest start node:
								let startNode = ref.current.childNodes[0]
								while (startNode.childNodes.length) {
									startNode = startNode.childNodes[0]
								}
								// Iterate to the deepest end node:
								let endNode = ref.current.childNodes[ref.current.childNodes.length - 1]
								while (endNode.childNodes.length) {
									endNode = endNode.childNodes[endNode.childNodes.length - 1]
								}
								// Correct range:
								range.setStart(startNode, 0)
								range.setEnd(endNode, (endNode.nodeValue || "").length)
								selection.removeAllRanges()
								selection.addRange(range)
							}
							const [pos1, pos2] = computePosRange(ref.current)
							const extRootPosRange = extendRootPostRange(state.data, [pos1.root, pos2.root])
							setState(current => ({
								...current,
								pos1,
								pos2,
								extRootPosRange,
							}))
						},

						onPointerDown: () => {
							isPointerDownRef.current = true
						},
						onPointerMove: () => {
							// Editor must be focused and pointer must be down:
							if (!state.focused || !isPointerDownRef.current) {
								isPointerDownRef.current = false // Reset to be safe
								return
							}
							const [pos1, pos2] = computePosRange(ref.current)
							const extRootPosRange = extendRootPostRange(state.data, [pos1.root, pos2.root])
							setState(current => ({
								...current,
								pos1,
								pos2,
								extRootPosRange,
							}))
						},
						onPointerUp: () => {
							isPointerDownRef.current = false
						},

						onKeyDown: e => {
							// if (!ref.current.childNodes.length) {
							// 	e.preventDefault()
							// 	return
							// }

							// // Undo:
							// if (detect.undo(e)) {
							// 	e.preventDefault()
							// 	dispatch.undo()
							// 	return
							// // Redo:
							// } else if (detect.redo(e)) {
							// 	e.preventDefault()
							// 	dispatch.redo()
							// 	return
							// }

							// // Tab (e.ctrlKey must be false because of
							// // common shortcuts):
							// if (!e.ctrlKey && e.keyCode === KeyCodes.Tab) {
							// 	e.preventDefault()
							// 	let action = null
							// 	switch (true) {
							// 	// TODO: state.pos.id breaks down for
							// 	// multiline components
							// 	case !e.shiftKey && state.pos1.id === state.pos2.id:
							// 		action = actions.tab
							// 		break
							// 	// TODO: state.pos.id breaks down for
							// 	// multiline components
							// 	case !e.shiftKey && state.pos1.id !== state.pos2.id:
							// 		action = actions.tabMany
							// 		break
							// 	case e.shiftKey:
							// 		action = actions.detabMany
							// 		break
							// 	default:
							// 		// No-op
							// 	}
							// 	action(state, setState)
							// 	return
							// }
							// // Enter:
							// if (e.keyCode === KeyCodes.Enter) {
							// 	e.preventDefault()
							// 	actions.enter(state, setState)
							// 	return
							// }
						},

						// TODO: onCompositionEnd
						onInput: () => {
							if (!ref.current.childNodes.length) {
								// No-op
								setState(current => ({
									...current,
									data: [...state.data],
								}))
								return
							}

							// TODO: Rename syncPosRoots to syncRootPos

							// let rootPosRange = state.extRootPosRange
							// // Guard the extended end root ID; when a user
							// // enters or backspaces on the end root, the
							// // DOM and VDOM become out of sync:
							// if (state.data.findIndex(each => each.id === rootPosRange[1]) === -1) {
							// 	let index = state.data.length - 2
							// 	if (index < 0) {
							// 		index = 0
							// 	}
							// 	rootPosRange[1] = state.data[index].id
							// }
							// console.log(rootPosRange)

							let [startID, endID] = state.extRootPosRange

							// Query the start root:
							const startRoot = document.getElementById(startID)
							if (!startRoot || !ref.current.contains(startRoot)) {
								console.error(`startID=${startID}`)
								throw new Error("readRoots: no such startRoot or out of bounds")
							}
							// Query the end root:
							let endRoot = document.getElementById(endID)
							let atEnd = false // Is endRoot at the end?
							const next = endRoot && endRoot.nextElementSibling
							// If backspaced was pressed on the end root,
							// query the second-to-end root:
							if (!endRoot) {
								endRoot = ref.current.children[ref.current.children.length - 1]
								atEnd	= true
								// // FIXME: Change to x2 from startRoot?
								// let index = state.data.length - 2
								// if (index < 0) {
								// 	index = 0
								// }
								// endID	= state.data[index].id
								// alert(`endID=${endID}`)
								// endRoot = document.getElementById(endID)
								// atEnd = true
							// If enter was pressed on the end root, re-
							// extend the end root 1x:
							} else if (next && next.getAttribute("data-root") && (!next.id || next.id === endRoot.id)) {
								// Correct the ID:
								next.id = uuidv4()
								endRoot = next
								atEnd = true
							}
							if (!endRoot || !ref.current.contains(endRoot)) {
								console.error(`endID=${endID}`)
								throw new Error("readRoots: no such endRoot or out of bounds")
							}

							const startIndex = state.data.findIndex(each => each.id === startRoot.id)
							if (startIndex === -1) {
								throw new Error("onInput: startIndex out of bounds")
							}
							const endIndex = !atEnd ? state.data.findIndex(each => each.id === endRoot.id) : state.data.length - 1
							if (endIndex === -1) {
								throw new Error("onInput: endIndex out of bounds")
							}
							const unparsed = readRoots(ref.current, [startRoot, endRoot])
							const [pos1, pos2] = computePosRange(ref.current)
							setState(current => ({ // FIXME: Use current
								...current,
								data: [...state.data.slice(0, startIndex), ...parse(unparsed), ...state.data.slice(endIndex + 1)],
								pos1,
								pos2,
							}))
							// console.log(unparsed)

							// if (!endRoot || !editorRoot.contains(endRoot)) {
							// 	throw new Error(`readRoots: no such id=${endID || ""} or out of bounds`)
							// }
							// // // When next has no ID or a repeat ID, extend endRoot,
							// // // correct the ID, and set atEnd to true:
							// // let atEnd = false
							// // const next = endRoot.nextElementSibling
							// // if (next && next.getAttribute("data-root") && (!next.id || next.id === endRoot.id)) {
							// // 	// alert("test")
							// // 	endRoot = next
							// // 	endRoot.id = uuidv4()
							// // 	atEnd	= true
							// // }
							// // return { roots: [startRoot, endRoot], atEnd }
							// return { roots: [startRoot, endRoot] /* , atEnd */ }

							// const { roots, atEnd } = queryRoots(ref.current, state.extRootPosRange)
							// console.log(...roots)
							// const index1 = state.data.findIndex(each => each.id === roots[0].id)
							// if (index1 === -1) {
							// 	throw new Error("onInput: index1 out of bounds")
							// }
							// const index2 = !atEnd ? state.data.findIndex(each => each.id === roots[1].id) : state.data.length - 1
							// if (index2 === -1) {
							// 	throw new Error("onInput: index2 out of bounds")
							// }
							// const unparsed = readRoots(ref.current, roots)
							// const [pos1, pos2] = computePosRange(ref.current)
							// setState(current => ({
							// 	...current,
							// 	data: [...state.data.slice(0, index1), ...parse(unparsed), ...state.data.slice(index2 + 1)],
							// 	pos1,
							// 	pos2,
							// }))
							// // console.log(unparsed)
						},

						contentEditable: !state.readOnly, // Inversed
						suppressContentEditableWarning: !state.readOnly, // Inversed
					},
				)}

				{DEBUG_MODE && (
					<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
						{JSON.stringify(
							{
								extRootPosRange: state.extRootPosRange,
								id: state.data.map(each => each.id),

								// ...state,
								// reactDOM: undefined, // Obscure
							},
							null,
							"\t",
						)}
					</div>
				)}

			</div>
		</Provider>
	)
}

export default Editor
