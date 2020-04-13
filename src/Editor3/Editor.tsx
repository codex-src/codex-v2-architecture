import * as Types from "Editor3/__types"
import EditorContext from "Editor3/EditorContext"
import React from "react"
import ReactDOM from "react-dom"

import {
	Root,
} from "./HOC"

type ParagraphProps = {
	id:  string,
	raw: string,
}

const Paragraph = ({ id, raw }: ParagraphProps) => (
	<Root id={id}>
		{raw || (
			<br />
		)}
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
						<Paragraph key={each.id} {...each} />
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
