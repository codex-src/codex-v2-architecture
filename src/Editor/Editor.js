import EditorContext from "./EditorContext"
import React from "react"
import ReactDOM from "react-dom"

const Editor = React.forwardRef(({ className, style, state, setState, ...props }, ref) => {

	// Rerender the React-managed DOM when state.data changes:
	React.useLayoutEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			<Provider value={[state, setState]}>
				{state.data.map(({ type: Type, children: data, ...each }) => (
					<Type key={each.id} data={data} {...each} />
				))}
			</Provider>,
			ref.current,
		)
	}, [state, setState, ref])

	return (
		React.createElement(
			"div",
			{
				ref,

				className:
					`codex-editor ${
						!state.readOnly ? "" : " feature-read-only"
					}${
						!className ? "" : ` ${className}`
					}`,

				style: {
					MozTabSize: 4,
					tabSize: 4,

					// // contenteditable:
					// caretColor: "black",
					//
					// // Imperative styles for contenteditable:
					// whiteSpace: "pre-wrap",
					// outline: "none",
					// overflowWrap: "break-word",

					...style,
				},

				// contentEditable: !state.readOnly,
				// suppressContentEditableWarning: !state.readOnly,

				// "data-feature-read-only": state.readOnly || null,
			},
		)
	)
})

export default Editor
