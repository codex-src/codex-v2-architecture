import Prism from "./Prism"
import React from "react"

const AppCode = ({ extension, style, children }) => {
	const [html, setHTML] = React.useState(null)

	React.useEffect(() => {
		if (!extension) {
			// No-op
			return
		}
		const parser = Prism[extension]
		if (!parser) {
			// No-op
			return
		}
		setHTML((
			<div className={extension && `language-${extension}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(children, parser, extension),
			}} />
		))
	}, [extension, children])

	return (
		<div className="px-6 py-4 bg-white rounded-lg shadow-hero-lg overflow-x-scroll scrolling-touch" style={style}>
			<span className="inline-block">
				<div className="whitespace-pre font-mono text-sm leading-snug">
					{html || (
						children
					)}
				</div>
			</span>
		</div>
	)
}

export default AppCode
