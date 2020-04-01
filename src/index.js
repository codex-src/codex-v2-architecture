import App from "./App"
import Prism from "./Prism"
import React from "react"
import ReactDOM from "react-dom"

import "./prism-custom.css"

;(() => {
	// Render React DOM:
	ReactDOM.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
		document.getElementById("root"),
	)
	// Load PrismJS languages:
	document.addEventListener("DOMContentLoaded", e => {
		if (!window.Prism || !window.Prism.languages) {
			// No-op
			return
		}
		/* eslint-disable no-multi-spaces */
		Prism.bash       = window.Prism.languages.bash
		Prism.c          = window.Prism.languages.c
		Prism.cpp        = window.Prism.languages.cpp
		Prism.css        = window.Prism.languages.css
		Prism.d          = window.Prism.languages.d
		Prism.diff       = window.Prism.languages.diff
		Prism.docker     = window.Prism.languages.docker
		Prism.dockerfile = window.Prism.languages.dockerfile
		Prism.git        = window.Prism.languages.git
		Prism.go         = window.Prism.languages.go
		// Prism.gql     = window.Prism.languages.graphql
		Prism.graphql    = window.Prism.languages.graphql
		// Prism.htm     = window.Prism.languages.html
		Prism.html       = window.Prism.languages.html
		Prism.http       = window.Prism.languages.http
		Prism.js         = window.Prism.languages.jsx
		Prism.json       = window.Prism.languages.json
		Prism.jsx        = window.Prism.languages.jsx // Uses jsx
		Prism.kotlin     = window.Prism.languages.kotlin
		Prism.php        = window.Prism.languages.php
		Prism.py         = window.Prism.languages.py
		Prism.rb         = window.Prism.languages.rb
		Prism.ruby       = window.Prism.languages.ruby
		Prism.rust       = window.Prism.languages.rust
		Prism.sass       = window.Prism.languages.sass
		Prism.sh         = window.Prism.languages["shell-session"]
		// Prism.shell   = window.Prism.languages["shell-session"]
		Prism.sql        = window.Prism.languages.sql
		Prism.svg        = window.Prism.languages.svg
		Prism.swift      = window.Prism.languages.swift
		Prism.ts         = window.Prism.languages.tsx // Uses tsx
		Prism.tsx        = window.Prism.languages.tsx
		Prism.wasm       = window.Prism.languages.wasm
		Prism.xml        = window.Prism.languages.xml
		Prism.yaml       = window.Prism.languages.yaml
		Prism.yml        = window.Prism.languages.yml
		/* eslint-enable no-multi-spaces */
	})
})()
