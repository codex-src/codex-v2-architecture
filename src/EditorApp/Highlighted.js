import prismMap from "lib/prismMap"
import React from "react"

const Highlighted = React.memo(({ extension, children }) => {
	const [highlighted, setHighlighted] = React.useState(null)

	React.useEffect(() => {
		if (!extension) {
			// No-op
			return
		}
		const parser = prismMap[extension]
		if (!parser) {
			// No-op
			return
		}
		setHighlighted((
			<div className={extension === undefined ? null : `language-${extension}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(children, parser, extension),
			}} />
		))
	}, [extension, children])

	return highlighted || children
})

export default Highlighted
