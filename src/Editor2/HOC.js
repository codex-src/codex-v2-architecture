import React from "react"

// Higher order component for a paragraph component.
export const Paragraph = ({ id, tag, style, ...props }) => (
	React.createElement(
		tag || "div",
		{
			id,
			"style": { whiteSpace: "pre-wrap", ...style },
			"data-paragraph": true,
			...props,
		},
	)
)

// Higher order component for a multiline component.
export const Multiline = ({ id, tag, style, ...props }) => (
	React.createElement(
		tag || "div",
		{
			id,
			"style": { whiteSpace: "pre-wrap", ...style },
			"data-multiline": true,
			...props,
		},
	)
)
