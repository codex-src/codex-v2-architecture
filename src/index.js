import App2 from "./App2"
import React from "react"
import ReactDOM from "react-dom"

import "debug.css"

import "./stylesheets/prism-custom.css"
import "./stylesheets/tailwind-codex-overrides.css"
import "./stylesheets/tailwind-form-checkbox.css"

ReactDOM.render(
	// <React.StrictMode>
	// 	<App2 />
	// </React.StrictMode>,
	<App2 />,
	document.getElementById("root"),
)
