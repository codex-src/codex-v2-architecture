import React from "react"

type HOCProps = {
	tag?: string,
	id: string,
	className?: string,
	style?: React.CSSProperties,
  children: React.ReactNode,
}

// NOTE: Shadows browser API
export const Node = ({ tag, id, style, ...props }: HOCProps) => (
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

export const Root = ({ tag, id, style, ...props }: HOCProps) => (
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
