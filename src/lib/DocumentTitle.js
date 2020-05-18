import React from "react"

// Renders to document.title. Can be used as an effect.
const DocumentTitle = ({ title, children }) => {
	React.useEffect(() => {
		if (!title) {
			// No-op
			return
		}
		const originalTitle = document.title
		document.title = title
		return () => {
			document.title = originalTitle
		}
	}, [title])
	return children || null
}

export default DocumentTitle
