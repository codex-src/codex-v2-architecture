import attrs from "./attrs"
import computePosRange from "./computePosRange"
import EditorContext from "./EditorContext"
import keyCodes from "./keyCodes"
import queryRoots from "./queryRoots"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
import syncDOM from "./syncDOM"
import syncDOMPos from "./syncDOMPos"
import typeEnumMap from "./typeEnumMap"

import "./Editor.css"

// const DEBUG_MODE = true // true && process.env.NODE_ENV !== "production"
//
// ;(() => {
// 	document.body.classList.toggle("debug-css")
// })()

// TODO: Add React.memo?
const ReactEditor = ({ state, dispatch }) => {
	const { Provider } = EditorContext
	return (
		<Provider value={[state, dispatch]}>
			{state.reactVDOM.map(({ type: T, ...each }) => (
				React.createElement(typeEnumMap[T], {
					key: each.id,
					...each,
				})
			))}
		</Provider>
	)
}

const Editor = ({ tag, id, className, style, state, dispatch, readOnly }) => {
	const ref = React.useRef()

	const pointerDownRef = React.useRef()

	// Registers props.
	React.useLayoutEffect(() => {
		dispatch.registerProps(readOnly)
	}, [readOnly, dispatch])

	// Renders to the DOM.
	//
	// TODO: When state.readOnly is managed by JS (v. CSS),
	// syncDOM needs to mutate the DOM
	const mounted = React.useRef()
	React.useLayoutEffect(
		React.useCallback(() => {
			ReactDOM.render(<ReactEditor state={state} dispatch={dispatch} />, state.reactDOM, () => {
				// Sync DOM:
				const mutations = syncDOM(state.reactDOM, ref.current)
				if (!mounted.current || state.readOnly || !state.focused) {
					mounted.current = true
					return
				}
				if (mutations) {
					const s = !mutations ? "" : "s"
					console.log(`synced dom: ${mutations} mutation${s}`)
				}
				// Sync DOM cursors:
				const syncedPos = syncDOMPos(ref.current, [state.pos1, state.pos2])
				if (syncedPos) {
					console.log("synced pos")
				}
				// Force select for edge-cases such as forward-
				// backspace (pos does not change but the DOM does):
				const [pos1, pos2] = computePosRange(ref.current)
				dispatch.select(pos1, pos2)
			})
		}, [state, dispatch]),
		[state.readOnly, state.reactVDOM],
	)

	return (
		React.createElement(
			tag || "div",
			{
				ref,

				id,

				className:
					`codex-editor${
						!className ? "" : ` ${className}`
					}${
						!state.readOnly ? "" : " feature-read-only"
					}`,

				style: {
					...style, // Takes precedence
					...attrs.contenteditable,
				},

				onFocus: () => {
					if (state.readOnly) {
						// No-op
						return
					}
					dispatch.focus()
				},
				onBlur:  () => {
					if (state.readOnly) {
						// No-op
						return
					}
					dispatch.blur()
				},

				onSelect: () => {
					if (state.readOnly) {
						// No-op
						return
					}
					const selection = document.getSelection()
					if (!selection.rangeCount) {
						// No-op
						return
					}
					// Guard out of bounds range:
					const range = selection.getRangeAt(0)
					if (range.startContainer === ref.current || range.endContainer === ref.current) {
						// Iterate to the deepest start node:
						let node = ref.current.childNodes[0]
						while (node.childNodes.length) {
							node = node.childNodes[0]
						}

						// // Iterate to the deepest end node:
						// let node2 = ref.current.childNodes[ref.current.childNodes.length - 1]
						// while (node2.childNodes.length) {
						// 	node2 = node2.childNodes[node2.childNodes.length - 1]
						// }

						// Correct range:
						range.setStart(node, 0)
						range.collapse()
						selection.removeAllRanges()
						selection.addRange(range)
					}
					const [pos1, pos2] = computePosRange(ref.current)
					dispatch.select(pos1, pos2)
				},

				onPointerDown: () => {
					if (state.readOnly) {
						// No-op
						return
					}
					pointerDownRef.current = true
				},
				onPointerMove: () => {
					if (state.readOnly) {
						// No-op
						return
					}
					// Editor must be focused and pointer must be down:
					if (!state.focused || !pointerDownRef.current) {
						pointerDownRef.current = false // Reset to be safe
						return
					}
					const [pos1, pos2] = computePosRange(ref.current)
					dispatch.select(pos1, pos2)
				},
				onPointerUp: () => {
					if (state.readOnly) {
						// No-op
						return
					}
					pointerDownRef.current = false
				},

				onKeyDown: e => {
					if (state.readOnly) {
						// No-op
						return
					}
					// Tab:
					if (!e.ctrlKey && e.keyCode === keyCodes.Tab) {
						e.preventDefault()
						dispatch.tab()
						return
					// Enter:
					} else if (e.keyCode === keyCodes.Enter) {
						e.preventDefault()
						dispatch.enter()
						return
					}
					// // Undo:
					// } else if (detect.undo(e)) {
					// 	e.preventDefault()
					// 	dispatch.undo()
					// 	return
					// // Redo:
					// } else if (detect.redo(e)) {
					// 	e.preventDefault()
					// 	dispatch.redo()
					// 	return
					// }
				},

				// TODO: onCompositionEnd
				onInput: () => {
					// debugger
					if (state.readOnly) {
						// No-op
						return
					}
					// Force rerender when empty:
					if (!ref.current.childNodes.length) {
						dispatch.render()
						return
					}
					const { roots: [root1, root2], atEnd } = queryRoots(ref.current, state.extPosRange)
					const nodes = readRoots(ref.current, [root1, root2])
					const [pos1, pos2] = computePosRange(ref.current)
					dispatch.input(nodes, atEnd, [pos1, pos2])
				},

				contentEditable: !state.readOnly,
				suppressContentEditableWarning: !state.readOnly,
			},
		)
	)
}

// {DEBUG_MODE && (
// 	<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ MozTabSize: 2, tabSize: 2 }}>
// 		{JSON.stringify(
// 			{
// 				...state,
// 				reactVDOM: undefined,
// 				reactDOM:  undefined,
// 			},
// 			null,
// 			"\t",
// 		)}
// 	</div>
// )}

export default Editor
