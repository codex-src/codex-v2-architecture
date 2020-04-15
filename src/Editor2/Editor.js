import actions from "./actions"
import attrs from "./attrs"
import computePosRange from "./computePosRange"
import EditorContext from "./EditorContext"
import extendPosRange from "./extendPosRange"
import keyCodes from "./keyCodes"
import parse from "./parser"
import queryRoots from "./queryRoots"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
import syncPos from "./syncPos"
import syncTrees from "./syncTrees"
import typeMap from "./typeMap"

import "./Editor.css"

const DEBUG_MODE = true && process.env.NODE_ENV !== "production"

const Document = ({ state, setState }) => (
	<EditorContext.Provider value={[state, setState]}>
		{state.data.map(({ type: T, ...each }) => (
			React.createElement(typeMap[T], {
				key: each.id,
				...each,
			})
		))}
	</EditorContext.Provider>
)

;(() => {
	document.body.classList.toggle("debug-css")
})()

function shouldRenderPos(state) {
	const ok = (
		state.focused &&
		!state.readOnly
	)
	return ok
}

const Editor = ({ tag, id, state, setState }) => {
	const ref = React.useRef()

	const pointerDownRef = React.useRef()

	// Renders to the DOM.
	const mounted = React.useRef()
	React.useLayoutEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document state={state} setState={setState} />, state.reactDOM, () => {
				// Sync user-managed DOM to the React-managed DOM:
				const mutations = syncTrees(state.reactDOM, ref.current)
				if (!mounted.current || !shouldRenderPos(state)) {
					mounted.current = true
					return
				}
				if (mutations) {
					const s = !mutations ? "" : "s"
					console.log(`syncTrees: ${mutations} mutation${s}`)
				}
				// Sync DOM cursors to the VDOM cursors:
				const syncedPos = syncPos(ref.current, [state.pos1, state.pos2])
				if (syncedPos) {
					console.log("syncPos")
				}
				// Update extendedPosRange for edge-cases such as
				// forward-backspace:
				const [pos1, pos2] = computePosRange(ref.current)
				const extendedPosRange = extendPosRange(state, [pos1, pos2])
				setState(current => ({ ...current, pos1, pos2, extendedPosRange }))
			})
		}, [state, setState]),
		[
			state.data,
			state.readOnly,
		],
	)

	// Binds read-only shortcut.
	React.useEffect(
		React.useCallback(() => {
			const handler = e => {
				if (e.keyCode !== keyCodes.P) {
					// No-op
					return
				}
				e.preventDefault()
				setState(current => ({
					...current,
					readOnly: !state.readOnly,
				}))
			}
			document.addEventListener("keydown", handler)
			return () => {
				document.removeEventListener("keydown", handler)
			}
		}, [state, setState]),
		[state.readOnly],
	)

	return (
		<div>

			{React.createElement(
				tag || "div",
				{
					ref,

					id,

					// className:
					// 	`codex-editor ${
					// 		!state.readOnly ? "" : " feature-read-only"
					// 	}${
					// 		!className ? "" : ` ${className}`
					// 	}`,
					className: "codex-editor",

					style: {
						...attrs.contenteditable,
						caretColor: "black",
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
						const extendedPosRange = extendPosRange(state, [pos1, pos2])
						setState(current => ({ ...current, pos1, pos2, extendedPosRange }))
					},

					onPointerDown: () => {
						pointerDownRef.current = true
					},
					onPointerMove: () => {
						// Editor must be focused and pointer must be down:
						if (!state.focused || !pointerDownRef.current) {
							pointerDownRef.current = false // Reset to be safe
							return
						}
						const [pos1, pos2] = computePosRange(ref.current)
						const extendedPosRange = extendPosRange(state, [pos1, pos2])
						setState(current => ({ ...current, pos1, pos2, extendedPosRange }))
					},
					onPointerUp: () => {
						pointerDownRef.current = false
					},

					onKeyDown: e => {
						if (e.keyCode === keyCodes.Enter) {
							e.preventDefault()
							actions.enter(state, setState)
							return
						}
						// TODO
					},

					// TODO: onCompositionEnd
					onInput: () => {
						// Force re-render when empty:
						if (!ref.current.childNodes.length) {
							setState(current => ({
								...current,
								data: [...state.data],
							}))
							return
						}
						const { roots: [root1, root2], root2AtEnd } = queryRoots(ref.current, state.extendedPosRange)
						const x1 = state.data.findIndex(each => each.id === root1.id)
						if (x1 === -1) {
							throw new Error("onInput: x1 out of bounds")
						}
						const x2 = !root2AtEnd ? state.data.findIndex(each => each.id === root2.id) : state.data.length - 1
						if (x2 === -1) {
							throw new Error("onInput: x2 out of bounds")
						}
						const unparsed = readRoots(ref.current, [root1, root2])
						const [pos1, pos2] = computePosRange(ref.current)
						setState(current => ({ // FIXME: Use current
							...current,
							data: [...state.data.slice(0, x1), ...parse(unparsed), ...state.data.slice(x2 + 1)],
							pos1,
							pos2,
							// NOTE: Do not extendPosRange here; defer to
							// useLayoutEffect
						}))
					},

					contentEditable: !state.readOnly,
					suppressContentEditableWarning: !state.readOnly,
				},
			)}

			{DEBUG_MODE && (
				<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
					{JSON.stringify(
						{
							// extendedPosRange: state.extendedPosRange,
							// id: state.data.map(each => each.id),

							...state,
							reactDOM: undefined, // Obscure
						},
						null,
						"\t",
					)}
				</div>
			)}

		</div>
	)
}

export default Editor
