import App3 from "./App3"
import React from "react"
import ReactDOM from "react-dom"

import "debug.css"

import "./stylesheets/prism-custom.css"
import "./stylesheets/tailwind-form-checkbox.css"
import "./stylesheets/tailwind-codex-overrides.css"

ReactDOM.render(
	<React.StrictMode>
		<App3 />
	</React.StrictMode>,
	document.getElementById("root"),
)
