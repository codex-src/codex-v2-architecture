import React from "react"

// Higher order components that describe paragraph or
// multiline paragraph components.

// TODO: Remove data-* attribute? ID may be enough
export const Paragraph = ({ id, tag, style, ...props }) => (
	React.createElement(tag || "div", {
		id,
		"style": {
			// NOTE: white-space: pre-wrap is needed because of
			// contenteditable
			whiteSpace: "pre-wrap",
			...style,
		},
		"data-paragraph": true,
		...props,
	})
)

// // TODO: Remove data-* attribute? ID may be enough
// export const Multiline = ({ id, tag, style, ...props }) => (
// 	React.createElement(tag || "div", {
// 		id,
// 		"style": {
// 			// NOTE: white-space: pre-wrap is needed because of
// 			// contenteditable
// 			whiteSpace: "pre-wrap",
// 			...style,
// 		},
// 		// "data-multiline": true,
// 		...props,
// 	})
// )
