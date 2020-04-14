import * as Types from "Editor3/__types"
import computePos from "./computePos"
import EditorContext from "Editor3/EditorContext"
import extendPosRange from "./extendPosRange"
import parse from "./parser"
import queryRoots from "./queryRoots"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
import TypeMap from "./TypeMap"

const DEBUG_ENABLED = true && process.env.NODE_ENV !== "production"

type DocumentProps = {
	state:    Types.EditorState,
	setState: Types.EditorSetStateAction,
}

const Document = ({ state, setState }: DocumentProps) => (
	<EditorContext.Provider value={[state, setState]}>
		{state.data.map(({ type: T, ...each }) => (
			React.createElement(TypeMap[T], {
				key: each.id,
				...each,
			// NOTE: Use as any or expect errors; Array.map drops
			// the type -- I think?
			} as any)
		))}
	</EditorContext.Provider>
)

type EditorProps = {
	state:    Types.EditorState,
	setState: Types.EditorSetStateAction,
}

;(() => {
	document.body.classList.toggle("debug-css")
})()

const Editor = ({ state, setState }: EditorProps) => {
	const ref = React.useRef<null | HTMLElement>(null)

	// Tracks whether a pointer is down.
	const pointerIsDownRef = React.useRef<null | boolean>()

	React.useEffect(
		React.useCallback(() => {
			ReactDOM.render(<Document state={state} setState={setState} />, ref.current, () => {
				// TODO
			})
		}, [state, setState]),
		[state.data],
	)

	// TODO: Register props e.g. readOnly
	return (
		<div>

			{React.createElement(
				"div",
				{
					ref,

					className: "codex-editor",

					style: {
						// Imperative styles needed because of
						// contenteditable:
						whiteSpace: "pre-wrap",
						outline: "none",
						overflowWrap: "break-word",

						caretColor: "black",
					},

					onFocus: () => setState(current => ({ ...current, focused: true })),
					onBlur:  () => setState(current => ({ ...current, focused: false })),

					onSelect: () => {
						// Guard out of bounds range:
						const selection = document.getSelection()
						if (!selection || !selection.rangeCount) {
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
						const [pos1, pos2] = computePos(ref.current!)
						const extPosRange = extendPosRange(state, [pos1, pos2])
						setState(current => ({
							...current,
							pos1,
							pos2,
							extPosRange,
						}))
					},

					onPointerDown: () => {
						pointerIsDownRef.current = true
					},
					onPointerMove: () => {
						// Editor must be focused and pointer must be down:
						if (!state.focused || !pointerIsDownRef.current) {
							pointerIsDownRef.current = false // Reset to be safe
							return
						}
						const [pos1, pos2] = computePos(ref.current!)
						const extPosRange = extendPosRange(state, [pos1, pos2])
						setState(current => ({
							...current,
							pos1,
							pos2,
							extPosRange,
						}))
					},
					onPointerUp: () => {
						pointerIsDownRef.current = false
					},

					onInput: () => {
						// Force a re-render when empty:
						if (!ref.current!.childNodes.length) {
							// No-op
							setState(current => ({
								...current,
								data: [...state.data],
							}))
							return
						}
						const { roots: [root1, root2], root2AtEnd } = queryRoots(ref.current!, state.extPosRange)
						const x1 = state.data.findIndex(each => each.id === root1.id)
						if (x1 === -1) {
							throw new Error("onInput: x1 out of bounds")
						}
						const x2 = !root2AtEnd ? state.data.findIndex(each => each.id === root2.id) : state.data.length - 1
						if (x2 === -1) {
							throw new Error("onInput: x2 out of bounds")
						}
						const unparsed = readRoots(ref.current!, [root1, root2])
						const [pos1, pos2] = computePos(ref.current!)
						setState(current => ({
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

			{DEBUG_ENABLED && (
				<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
					{JSON.stringify(state, null, "\t")}
					{/* {JSON.stringify( */}
					{/* 	{ */}
					{/* 		extPosRange: state.extPosRange, */}
					{/* 		id: state.data.map(each => each.id), */}
					{/* 	}, */}
					{/* 	null, */}
					{/* 	"\t", */}
					{/* )} */}
				</div>
			)}

		</div>
	)
}

export default Editor
