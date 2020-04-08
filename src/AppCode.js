import Prism from "./Prism"
import React from "react"

const AppCode = ({ info, style, children }) => {
	const [html, setHTML] = React.useState(null)

	React.useEffect(() => {
		const language = info.split(".").slice(-1)[0].toLowerCase()
		if (!language) {
			// No-op
			return
		}
		const parser = Prism[language]
		if (!parser) {
			// No-op
			return
		}
		setHTML((
			<div className={language && `language-${language}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(children, parser, language),
			}} />
		))
	}, [info, children])

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
