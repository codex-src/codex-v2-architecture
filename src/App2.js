import Enum from "Enum"
import React from "react"

const Type = new Enum(
	"P", // Paragraph
)

const Editor = ({ state, setState }) => (
	"Hello, world!"
)

const App = () => {
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

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">
				<Editor />
			</div>
		</div>
	)
}

export default App
