import App from "EditorApp/EditorApp"
import React from "react"
import ReactDOM from "react-dom"

import "debug.css"
import "stylesheets/material-design/color-vars.css"
import "stylesheets/prism-js/custom.css"
import "stylesheets/tailwind-css/color-vars.css"
import "stylesheets/tailwind-css/em-context.css"
import "stylesheets/tailwind-css/tailwind.generated.css"

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
