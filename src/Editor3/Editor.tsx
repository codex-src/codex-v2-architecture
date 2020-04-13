import * as Types from "Editor3/__types"
import EditorContext from "Editor3/EditorContext"
import React from "react"
import ReactDOM from "react-dom"
import TypeMap from "./TypeMap"

const Editor = ({ state, setState }: Types.EditorProps) => {
	const ref = React.useRef<null | HTMLDivElement>(null)

	React.useEffect(
		React.useCallback(() => {
			const { Provider } = EditorContext
			ReactDOM.render(
				<Provider value={[state, setState]}>
					{state.data.map(({ type: T, ...each }) => (
						React.createElement(TypeMap[T], {
							key: each.id,
							...each,
						// NOTE: Array.map drops type -- I think?
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

export default Editor
