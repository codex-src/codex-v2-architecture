import Prism from "./Editor/Prism"
import React from "react"

const CodeExport = ({ lang, data, ...props }) => {
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
				__html: window.Prism.highlight(data, parser, lang),
			}} />
		))
	}, [lang, data])

	return (
		<div className="px-6 py-4 bg-white rounded-lg shadow-hero-lg" {...props}>
			<div className="whitespace-pre-wrap break-words font-mono text-sm leading-snug">
				{html || (
					data
				)}
			</div>
		</div>
	)
}

export default CodeExport
