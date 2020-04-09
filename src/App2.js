import Enum from "Enum"
import React from "react"
import ReactDOM from "react-dom"

const Type = new Enum("P", // Paragraph
)

const Paragraph = ({ id, data }) => (
	<div id={id} data-block-element>
		{data}
	</div>
)

const typeMap = {
	[Type.P]: Paragraph,
}

const EditorContext = React.createContext()

const Editor = ({
	id,       // Optional ID
	tag,      // Optional tag (uses <div> by default)
	state,    // Required
	setState, // Required
}) => {
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

				contentEditable: true,
				suppressContentEditableWarning: true,
			},
		)
	)
}

function useEditor(initialValue, options = null) {
	const [state, setState] = React.useState(() => ({
		data: [
			{
				type: Type.P,
				id: "abc-123-xyz",
				data: "Hello, world!",
			},
		],
		pos1: {
			id: "",
			offset: "",
		},
		pos2: {
			id: "",
			offset: "",
		},
	}))
	return [state, setState]
}

const App = () => {
	const [state, setState] = useEditor("Hello, world!")

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

export default App
