import * as Types from "./__types"
import React from "react"

// NOTE: Shadows browser API
export const Node = ({ id, tag, style, ...props }: Types.HOCProps) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			// NOTE: white-space: pre-wrap is needed because of
			// contenteditable
			whiteSpace: "pre-wrap",
			...style,
		},
		"data-node": true,
		...props,
	})
)

export const Root = ({ id, tag, style, ...props }: Types.HOCProps) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			// NOTE: white-space: pre-wrap is needed because of
			// contenteditable
			whiteSpace: "pre-wrap",
			...style,
		},
		"data-root": true,
		...props,
	})
)