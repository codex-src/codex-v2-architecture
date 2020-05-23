import React from "react"

// NOTE (1): Use whiteSpace: "pre-wrap" because of
// contenteditable
// NOTE (2): whiteSpace: "pre-wrap" takes precedence because
// of <Pre>

// NOTE: Shadows browser API
export const Node = React.forwardRef(({ id, tag, style, ...props }, ref) => (
	React.createElement(tag || "div", { ref,
		id,
		style: { whiteSpace: "pre-wrap", ...style },
		...props })
))

export const Root = React.forwardRef(({ id, tag, style, ...props }, ref) => (
	React.createElement(tag || "div", { ref,
		id,
		style: { whiteSpace: "pre-wrap", ...style },
		...props })
))
