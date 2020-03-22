import getPosFromRange from "./helpers/getPosFromRange"
import React from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

// Parses a plain text value into a data structure.
function parse(value) {
	const data = value.split("\n").map(each => ({
		id: uuidv4(),
		// TODO: Change API to left, top or x, y?
		cursor: {
			active: false,
			x1: 0, // NOTE: -1 refers to the end
			x2: 0, // NOTE: -1 refers to the end
		},
		value: each,
	}))
	return data
}

// Renders an editor block.
const Block = React.memo(({ block, ...props }) => {
	const measureRef = React.useRef()

	const [cursorStyle, setCursorStyle] = React.useState(null)
	React.useLayoutEffect(() => {
		const rect = measureRef.current.getBoundingClientRect()
		setCursorStyle({ left: rect.width })
	}, [block.cursor])

	return (
		<div id={block.id} className="relative" data-block>
			<div ref={measureRef} className="absolute pointer-events-none" data-measure>
				{block.cursor.active && (
					// Cursor:
					block.cursor.x1 === block.cursor.x2 ? (
						block.value.slice(0, block.cursor.x1)
					// Selection:
					) : (
						block.value.slice(block.cursor.x1, block.cursor.x2)
					)
				)}
			</div>
			<div className="absolute h-6 bg-blue-500" style={{ width: 2, ...cursorStyle }} data-cursor />
			<div>
				{block.value || (
					<br />
				)}
			</div>
		</div>
	)
})

// Renders the editor blocks.
const Blocks = ({ state, ...props }) => (
	state.data.map(each => (
		<Block key={each.id} block={each} />
	))
)

// {/* Measurer */}
// <div className="absolute right-0 top-0">
// 	{/* TODO */}
// </div>

// Renders an editor.
const Editor = ({ value: $value, ...props }) => {
	const ref = React.useRef()
	const [state, setState] = React.useState(() => {
		const data = parse($value)
		const state = {
			focused: false,
			data,
			pos1: {
				// id: "",
				// ref: null,
				x: 0,
				y: 0,
				pos: 0,
			},
			pos2: {
				// id: "",
				// ref: null,
				x: 0,
				y: 0,
				pos: 0,
			},
		}
		return state
	})

	// // Recompute virtual cursors:
	// React.useEffect(() => {
	// 	if (!state.focused) {
	// 		// No-op
	// 		return
	// 	}
	// 	console.log(state.pos1, state.pos2)
	// 	// Gets a complete or partial block element from a
	// 	// cursor (pos object).
	// 	function getPartialBlockElement(pos) {
	// 		console.log(pos)
	// 	}
	// 	getPartialBlockElement(state.pos1)
	// }, [state.focused, state.pos1, state.pos2])

	React.useEffect(() => {
		ReactDOM.render(<Blocks state={state} />, ref.current)
	}, [state])

	return (
		<div>

			{/* Editor */}
			{React.createElement(
				"div",
				{
					ref,

					className: "text-lg",

					// Imperative styles:
					style: {
						whiteSpace: "pre-wrap",
						outline: "none",
						overflowWrap: "break-word",
					},

					contentEditable: true,

					onFocus: e => {
						setState(current => ({
							...current,
							focused: true,
						}))
					},

					onBlur: e => {
						setState(current => ({
							...current,
							focused: false,
						}))
					},

					// TODO: Change to onPointerDown
					onSelect: e => {
						// if (!state.focused) {
						// 	// No-op
						// 	return
						// }
						const range = document.getSelection().getRangeAt(0)
						const pos1 = getPosFromRange(ref.current, range.startContainer, range.startOffset)
						let pos2 = { ...pos1 }
						if (!range.collapsed) {
							pos2 = getPosFromRange(ref.current, range.endContainer, range.endOffset)
						}
						const data = state.data.map((each, index) => {
							let cursor = null
							if (index < pos1.y || index > pos2.y) {
								cursor = {
									active: false,
									x1 :0,
									x2: 0,
								}
							} else if (index === pos1.y) {
								cursor = {
									active: true,
									x1: pos1.x,
									x2: pos1.y !== pos2.y ? -1 : pos2.x,
								}
							} else if (index > pos1.y && index < pos2.y) {
								cursor = {
									active: true,
									x1: 0,
									x2: -1,
								}
							} else if (index === pos2.y) {
								cursor = {
									active: true,
									x1: pos1.y !== pos2.y ? 0 : pos2.x,
									x2: pos2.x,
								}
							}
							return { ...each, cursor }
						})
						setState(current => ({ ...current, data, pos1, pos2 }))
						// setMeasure(pos1.ref.innerText.slice(0, pos1.x))
					},
				},
			)}

			{/* Debugger */}
			<div className="py-6 whitespace-pre font-mono text-xs" style={{ tabSize: 2 }}>
				{JSON.stringify(
					{
						...state,
						pos1: {
							...state.pos1,
							ref: undefined,
						},
						pos2: {
							...state.pos2,
							ref: undefined,
						}
					},
					null,
					"\t",
				)}
			</div>

		</div>
	)
}

const App = props => {
	const value = "hello, world!"

	return (
		<div className="flex flex-row justify-center">
			<div className="py-32 w-full max-w-xl">
				<Editor value={value} />
			</div>
		</div>
	)
}

export default App
