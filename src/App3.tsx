import React from "react"
import ReactDOM from "react-dom"
import uuidv4 from "uuid/v4"

/* eslint-disable no-multi-spaces */

type PosFragment = {
	id:     string, // Node or root UUID
	offset: number, // Offset to the cursor from the node or root
}

// Describes a cursor data structure.
type Pos = {
	node: PosFragment,
	root: PosFragment,
}

// Describes an unparsed element.
type UnparsedElement = {
	id:  string, // The UUID
	raw: string, // The raw-text
}

// Describes an editor state.
type EditorState = {
	readOnly:    boolean,           // Is the editor read-only?
	focused:     boolean,           // Is the editor focused?
	data:        UnparsedElement[], // The document data
	pos1:        Pos,               // The start cursor
	pos2:        Pos,               // The end cursor
	extPosRange: string[],          // The extended cursor range (root ID)
	reactDOM:    HTMLDivElement,    // The React-managed DOM -- obscured from the user
}


type EditorSetStateAction = React.Dispatch<React.SetStateAction<EditorState>>

type EditorSetState = [EditorState, EditorSetStateAction]

type EditorProps = {
	state:    EditorState,
	setState: EditorSetStateAction,
	// TODO: Etc.
}

/* eslint-enable no-multi-spaces */

const EditorContext = React.createContext<null | EditorSetState>(null)

// Constructor for a new cursor data structure.
function newPos(): Pos {
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

const Editor = ({ state, setState }: EditorProps) => {
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

function useEditor(initialValue: string): EditorSetState {
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
