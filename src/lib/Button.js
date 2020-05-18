import React from "react"

// Renders a button that does **not** focus when pressed.
//
// https://github.com/WICG/focus-visible
const Button = props => (
	<button onPointerDown={e => e.preventDefault()} {...props} />
)

export default Button
