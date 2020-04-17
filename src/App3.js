import React from "react"
import ReactDOM from "react-dom"
import useMethods from "use-methods"

const initialState = {
	focused: false,
}

const methods = state => ({
	focus() {
		console.log(Date.now())
		state.focused = true
	},
})

const App = () => {
	const [state, dispatch] = useMethods(methods, initialState)

	return <button onFocus={dispatch.focus}>test</button>
}

export default App
