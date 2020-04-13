import * as Types from "Editor3/__types"
import React from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

/* eslint-enable no-multi-spaces */

const EditorContext = React.createContext<null | Types.EditorSetState>(null)

// Constructor for a new cursor data structure.
function newPos(): Types.Pos {
	const pos = {
		node: {
			id: "",
			offset: 0,
		},
		root: {
			id: "",
			offset: 0,
		},
	}
	return pos
}

const Editor = ({ state, setState }: Types.EditorProps) => {
	const ref = React.useRef<null | HTMLDivElement>(null)

	React.useEffect(
		React.useCallback(() => {
			const { Provider } = EditorContext
			ReactDOM.render(
				<Provider value={[state, setState]}>
					{state.data.map(each => (
						<p key={each.id}>
							{each.raw}
						</p>
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

	return (
		<div>

			{React.createElement(
				"div",
				{
					ref,
				},
			)}

		</div>
	)
}

function useEditor(initialValue: string): Types.EditorSetState {
	const data = initialValue.split("\n").map(each => ({
		id: uuidv4(),
		raw: each,
	}))
	const [state, setState] = React.useState(() => ({
		readOnly: false,
		focused: false,
		data,
		pos1: newPos(),
		pos2: newPos(),
		extPosRange: ["", ""],
		reactDOM: document.createElement("div"),
	}))
	return [state, setState]
}

const App = () => {
	const [state, setState] = useEditor("hello\n\nhello\n\nhello")

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">
				<Editor
					state={state}
					setState={setState}
				/>
			</div>
		</div>
	)
}

// import Editor from "Editor2/Editor"
// import React from "react"
// import useEditor from "Editor2/useEditor"
//
// import "./App.css"
//
// const App = () => {
// 	const [state, setState] = useEditor(`# Hello, world!
//
// `)
// 	return (
// 		<div className="py-32 flex flex-row justify-center">
// 			<div className="px-6 w-full max-w-screen-md">
//
// 				<Editor
// 					state={state}
// 					setState={setState}
// 				/>
//
// 			</div>
// 		</div>
// 	)
// }

export default App
