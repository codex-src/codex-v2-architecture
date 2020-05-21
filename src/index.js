import App from "EditorApp/EditorApp"
import React from "react"
import ReactDOM from "react-dom"

import "debug.css"

import "stylesheets/material-design/color-vars.css"
import "stylesheets/tailwind/color-vars.css"

import "stylesheets/codex/core.css"
import "stylesheets/codex/elements-checkbox.css"
import "stylesheets/codex/elements.css"
import "stylesheets/codex/inline-elements.css"
import "stylesheets/prism/custom.css"
import "stylesheets/tailwind/tailwind.generated.css"

// https://github.com/facebook/create-react-app/blob/master/packages/cra-template/template/src/serviceWorker.js#L131
;(() => {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.ready
			.then(registration => {
				registration.unregister()
			})
			.catch(error => {
				console.error(error.message)
			})
	}
})()

ReactDOM.render(
	<App />,
	document.getElementById("root"),
)
