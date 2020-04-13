import * as Types from "Editor3/__types"
import computePos from "./computePos"
import EditorContext from "Editor3/EditorContext"
import React from "react"
import ReactDOM from "react-dom"
import TypeMap from "./TypeMap"

const DEBUG_ENABLED = true && process.env.NODE_ENV !== "production"

const Editor = ({ state, setState }: Types.EditorProps) => {
	const ref = React.useRef<null | HTMLDivElement>(null)

	// Tracks whether a pointer is down.
	const pointerIsDownRef = React.useRef<null | boolean>()

	React.useEffect(
		React.useCallback(() => {
			const { Provider } = EditorContext
			ReactDOM.render(
				<Provider value={[state, setState]}>
					{state.data.map(({ type: T, ...each }) => (
						React.createElement(TypeMap[T], {
							key: each.id,
							...each,
						// NOTE: Use as any or expect errors; Array.map
						// drops the type -- I think?
						} as any)
					))}
				</Provider>,
				ref.current,
				() => {
					// TODO
				},
			)
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
						// const extPosRange = extendPosRange(state, [pos1, pos2])
						setState(current => ({
							...current,
							pos1,
							pos2,
							// extPosRange,
						}))
					},

					contentEditable: !state.readOnly,
					suppressContentEditableWarning: !state.readOnly,
				},
			)}

			{DEBUG_ENABLED && (
				<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
					{JSON.stringify(state, null, "\t")}
				</div>
			)}

		</div>
	)
}

export default Editor
