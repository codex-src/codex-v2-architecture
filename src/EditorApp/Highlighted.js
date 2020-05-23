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

		const html = window.Prism.highlight(children, parser, extension)
			// .split("\n")
			// .map(each => `<div class="code-line">${each}</div>`)

		// // Pre-computed width; width: var(--width)
		// const width = String(String(lines.length).length) + "ch"

		setHighlighted((
			<div className={extension === undefined ? null : `language-${extension}`} /* style={{ "--width": width }} */ dangerouslySetInnerHTML={{
				__html: html,
			}} />
		))
	}, [extension, children])

	return highlighted || children
})

export default Highlighted
