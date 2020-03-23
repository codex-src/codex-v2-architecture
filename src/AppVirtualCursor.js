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
const Block = ({ focused, block, ...props }) => {
	const measureRef = React.useRef()

	// TODO: Selection (need to measure offset and width)
	const [cursorStyle, setCursorStyle] = React.useState(null)

	React.useLayoutEffect(() => {
		if (!focused) {
			setCursorStyle(null) // Reset
			return
		}
		const rect = measureRef.current.getBoundingClientRect()
		// Cursor:
		if (block.cursor.x1 === block.cursor.x2) {
			setCursorStyle({ left: rect.width, height: rect.height })
		// Selection:
		} else {
			setCursorStyle({ /* left: rect.width, */ width: rect.width, height: rect.height, opacity: 0.25 })
		}
	}, [focused, block.cursor])

	return (
		<div id={block.id} className="relative" style={{ caretColor: "transparent" }} data-block>
			{/* FIXME: Prevent selection */}
			<div ref={measureRef} className="absolute invisible pointer-events-none select-none" data-measure contentEditable={false}>
				{(focused && block.cursor.active) && (
					// Cursor:
					block.cursor.x1 === block.cursor.x2 ? (
						block.value.slice(0, block.cursor.x1) || "\u200b"
					// Selection:
					) : (
						block.value.slice(block.cursor.x1, block.cursor.x2)
					)
				)}
			</div>
			<div className="absolute bg-md-blue-a400 select-none" style={{ width: 2, ...cursorStyle /* , zIndex: -1 */ }} data-cursor contentEditable={false} />
			<div>
				{block.value || (
					<br />
				)}
			</div>
		</div>
	)
}

// Renders the editor blocks.
const Blocks = ({ state, ...props }) => (
	state.data.map(each => (
		<Block
			key={each.id}
			focused={state.focused}
			block={each}
		/>
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

					className: "codex-editor text-3xl",

					// Imperative styles:
					style: {
						whiteSpace: "pre-wrap",
						outline: "none",
						overflowWrap: "break-word",

						// Etc.
						lineHeight: 1.3,
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
			<div className="py-6 whitespace-pre-wrap font-mono text-xs" style={{ tabSize: 2 }}>
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
	const value = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

	return (
		<div className="flex flex-row justify-center">
			<div className="py-32 w-full max-w-3xl">
				<Editor value={value} />
			</div>
		</div>
	)
}

export default App
