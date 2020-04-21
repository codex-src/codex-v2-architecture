import React from "react"

// NOTE: Shadows browser API
export const Node = ({ id, tag, style, ...props }) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			// NOTE: white-space: pre-wrap is needed because of
			// contenteditable
			whiteSpace: "pre-wrap",
			...style,
		},
		"data-codex-node": true,
		...props,
	})
)

export const Pre = ({ id, tag, style, ...props }) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			whiteSpace: "pre",
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
			// NOTE: white-space: pre-wrap is needed because of
			// contenteditable
			whiteSpace: "pre-wrap",
			...style,
		},
		"data-codex-root": true,
		...props,
	})
)
