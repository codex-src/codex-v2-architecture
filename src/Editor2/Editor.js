import EditorContext from "./EditorContext"
import React from "react"
import ReactDOM from "react-dom"
import typeMap from "./typeMap"

const Editor = ({ id, tag, state, setState }) => {
	const ref = React.useRef()

	React.useEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			<Provider value={[state, setState]}>
				{state.data.map(({ type: T, ...props }) => (
					React.createElement(typeMap[T], {
						key: props.id,
						...props,
					})
				))}
			</Provider>,
			ref.current,
		)
	}, [state, setState])

	return (
		React.createElement(
			tag || "div",
			{
				ref,

				id,

				// Imperative styles:
				style: {
					outline: "none",
				},

				contentEditable: true,
				suppressContentEditableWarning: true,
			},
		)
	)
}

export default Editor
