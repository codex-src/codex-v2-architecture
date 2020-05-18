import React from "react"

// Wraps a React element when cond={true}.
const IfWrapper = ({ cond, wrapper: Wrapper, children }) => {
	if (!cond) {
		return children
	}
	return <Wrapper>{children}</Wrapper>
}

export default IfWrapper
