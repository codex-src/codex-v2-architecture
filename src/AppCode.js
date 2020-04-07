import Prism from "./Prism"
import React from "react"

const AppCode = ({ lang, style, children }) => {
	const [html, setHTML] = React.useState(null)

	React.useEffect(() => {
		if (!lang) {
			// No-op
			return
		}
		const parser = Prism[lang]
		if (!parser) {
			// No-op
			return
		}
		setHTML((
			<div className={lang && `language-${lang}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(children, parser, lang),
			}} />
		))
	}, [lang, children])

	return (
		<div className="px-6 py-4 bg-white rounded-lg shadow-hero-lg" style={style}>
			<div className="whitespace-pre-wrap break-words font-mono text-sm leading-snug">
				{html || (
					children
				)}
			</div>
		</div>
	)
}

export default AppCode
