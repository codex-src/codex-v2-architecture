import EditorContext from "./EditorContext"
import React from "react"
import ReactDOM from "react-dom"
import typeMap from "./typeMap"

const DEBUG = true && process.env.NODE_ENV !== "production"

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
		<div>

			{React.createElement(
				tag || "div",
				{
					ref,

					id,

					style: {
						outline: "none",
					},

					// onFocus: dispatch.actionFocus,
					// onBlur:  dispatch.actionBlur,

					contentEditable: true,
					suppressContentEditableWarning: true,
				},
			)}

			{DEBUG && (
				<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
					{JSON.stringify(state, null, "\t")}
				</div>
			)}

		</div>
	)
}

export default Editor
