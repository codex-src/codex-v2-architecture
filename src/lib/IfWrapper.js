import React from "react"

// Wraps a React element when when={true}.
const IfWrapper = ({ when, wrapper: Wrapper, children }) => {
	if (!when) {
		return children
	}
	return <Wrapper>{children}</Wrapper>
}

export default IfWrapper
