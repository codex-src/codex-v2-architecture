import App from "./App"
import Prism from "./Prism"
import React from "react"
import ReactDOM from "react-dom"

import "./prism-custom.css"

;(() => {
	ReactDOM.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
		document.getElementById("root"),
	)
	document.addEventListener("DOMContentLoaded", e => {
		if (!window.Prism || !window.Prism.languages) {
			// No-op
			return
		}
		/* eslint-disable no-multi-spaces */
		Prism.bash       = ["bash", window.Prism.languages.bash]
		Prism.c          = ["c", window.Prism.languages.c]
		Prism.cpp        = ["cpp", window.Prism.languages.cpp]
		Prism.css        = ["css", window.Prism.languages.css]
		Prism.d          = ["d", window.Prism.languages.d]
		Prism.diff       = ["diff", window.Prism.languages.diff]
		Prism.docker     = ["docker", window.Prism.languages.docker]
		Prism.dockerfile = ["dockerfile", window.Prism.languages.dockerfile]
		Prism.git        = ["git", window.Prism.languages.git]
		Prism.go         = ["go", window.Prism.languages.go]
		// Prism.gql     = ["graphql", window.Prism.languages.graphql]
		Prism.graphql    = ["graphql", window.Prism.languages.graphql]
		// Prism.htm     = ["html", window.Prism.languages.html]
		Prism.html       = ["html", window.Prism.languages.html]
		Prism.http       = ["http", window.Prism.languages.http]
		Prism.js         = ["jsx", window.Prism.languages.jsx]
		Prism.json       = ["json", window.Prism.languages.json]
		Prism.jsx        = ["jsx", window.Prism.languages.jsx] // Uses jsx
		Prism.kotlin     = ["kotlin", window.Prism.languages.kotlin]
		Prism.php        = ["php", window.Prism.languages.php]
		Prism.py         = ["py", window.Prism.languages.py]
		Prism.rb         = ["rb", window.Prism.languages.rb]
		Prism.ruby       = ["ruby", window.Prism.languages.ruby]
		Prism.rust       = ["rust", window.Prism.languages.rust]
		Prism.sass       = ["sass", window.Prism.languages.sass]
		Prism.sh         = ["shell-session", window.Prism.languages["shell-session"]]
		// Prism.shell   = ["shell-session", window.Prism.languages["shell-session"]]
		Prism.sql        = ["sql", window.Prism.languages.sql]
		Prism.svg        = ["svg", window.Prism.languages.svg]
		Prism.swift      = ["swift", window.Prism.languages.swift]
		Prism.ts         = ["tsx", window.Prism.languages.tsx] // Uses tsx
		Prism.tsx        = ["tsx", window.Prism.languages.tsx]
		Prism.wasm       = ["wasm", window.Prism.languages.wasm]
		Prism.xml        = ["xml", window.Prism.languages.xml]
		Prism.yaml       = ["yaml", window.Prism.languages.yaml]
		Prism.yml        = ["yml", window.Prism.languages.yml]
		/* eslint-enable no-multi-spaces */
	})
})()
