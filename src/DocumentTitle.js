import React from "react"

const DocumentTitle = ({ title, ...props }) => {
	React.useEffect(() => {
		if (!title) {
			// No-op
			return
		}
		document.title = title
	}, [title])
	// NOTE: Use props.children || null so <DocumentTitle> can
	// be used as an effect
	return props.children || null
}

export default DocumentTitle
