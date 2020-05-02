import React from "react"

const DocumentTitle = ({ title, children }) => {
	React.useEffect(() => {
		if (!title) {
			// No-op
			return
		}
		document.title = title
	}, [title])
	// NOTE: Use children || null so <DocumentTitle> can be
	// used as an effect
	return children || null
}

export default DocumentTitle
