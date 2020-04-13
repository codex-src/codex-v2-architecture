// // @flow
import React from "react"

// type HOCProps = {|
// 	id: string,
// 	tag?: string,
// 	style?: Object,
// 	props?: Object,
// |}

// NOTE: Shadows browser API
export const Node = ({ id, tag, style, ...props }/* : HOCProps */) => (
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

export const Root = ({ id, tag, style, ...props }/* : HOCProps */) => (
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
