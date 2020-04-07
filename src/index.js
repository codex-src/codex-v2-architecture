import App from "./App"
import React from "react"
import ReactDOM from "react-dom"

import "debug.css"

import "./stylesheets/prism-custom.css"
import "./stylesheets/tailwind-form-checkbox.css"
import "./stylesheets/tailwind-codex-overrides.css"

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)
