import * as Types from "Editor3/__types"
import EditorContext from "Editor3/EditorContext"
import React from "react"
import ReactDOM from "react-dom"

import {
	Root,
} from "./HOC"

type Temp = {
	id:  string,
	raw: string,
}

const P = ({ id, raw }: Temp) => (
	<Root id={id}>
		{raw}
	</Root>
)

const Editor = ({ state, setState }: Types.EditorProps) => {
	const ref = React.useRef<null | HTMLDivElement>(null)

	React.useEffect(
		React.useCallback(() => {
			const { Provider } = EditorContext
			ReactDOM.render(
				<Provider value={[state, setState]}>
					{state.data.map(each => (
						<P key={each.id} {...each} />
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
