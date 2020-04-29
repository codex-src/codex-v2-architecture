import React from "react"

// NOTE: Shadows browser’s Node API
export const Node = ({ id, tag, style, ...props }) => {
	const Type = tag || "div"
	return <Type id={id} style={{ whiteSpace: "pre-wrap", ...style }} data-node {...props} />
}

export const CompoundNode = ({ id, tag, style, ...props }) => {
	const Type = tag || "div"
	return <Type id={id} style={{ whiteSpace: "pre-wrap", ...style }} data-compound-node {...props} />
}
