import React from "react"

// NOTE: Shadows browser API
export const Node = React.memo(React.forwardRef(({ id, tag, style, ...props }, ref) => (
	React.createElement(tag || "div", {
		ref,
		id,
		"style": {
			// NOTE: Use white-space: pre-wrap because of
			// contenteditable
			whiteSpace: "pre-wrap", // Takes precedence (because of <Pre>)
			...style,
		},
		"data-codex-node": true,
		...props,
	})
)))

export const Root = React.memo(React.forwardRef(({ id, tag, style, ...props }, ref) => (
	React.createElement(tag || "div", {
		ref,
		id,
		"style": {
			// NOTE: Use white-space: pre-wrap because of
			// contenteditable
			whiteSpace: "pre-wrap", // Takes precedence (because of <Pre>)
			...style,
		},
		"data-codex-root": true,
		...props,
	})
)))
