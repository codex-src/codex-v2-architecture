import * as Types from "Editor3/__types"
import EditorContext from "Editor3/EditorContext"
import React from "react"
import ReactDOM from "react-dom"

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

export default Editor
