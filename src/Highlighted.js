import prismExtensions from "prismExtensions"
import React from "react"

// Performs syntax highlighting.
const Highlighted = React.memo(({ extension, children }) => {
	const [highlighted, setHighlighted] = React.useState(null)
	React.useEffect(() => {
		if (!extension) {
			// No-op
			return
		}
		const parser = prismExtensions[extension]
		if (!parser) {
			// No-op
			return
		}
		setHighlighted((
			<div className={extension && `language-${extension}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(children, parser, extension),
			}} />
		))
	}, [extension, children])
	return highlighted || children
})

export default Highlighted
