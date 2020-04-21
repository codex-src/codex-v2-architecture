import React from "react"

// NOTE: white-space: pre-wrap is needed because of
// contenteditable

// NOTE: Shadows browser API
export const Node = ({ id, tag, style, ...props }) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			whiteSpace: "pre-wrap", // Takes precedence (because of <Pre>)
			...style,
		},
		"data-codex-node": true,
		...props,
	})
)

export const Root = ({ id, tag, style, ...props }) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			whiteSpace: "pre-wrap", // Takes precedence (because of <Pre>)
			...style,
		},
		"data-codex-root": true,
		...props,
	})
)
