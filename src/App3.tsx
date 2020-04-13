import * as Types from "Editor3/__types"
import React from "react"
import ReactDOM from "react-dom"
import useEditor from "Editor3/useEditor"

const EditorContext = React.createContext<null | Types.EditorSetState>(null)

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

					// TODO: Etc.
				},
			)}

		</div>
	)
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
