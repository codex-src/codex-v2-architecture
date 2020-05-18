import React from "react"

// Renders to document.title and <link rel="icon">. Can be
// used as an effect.
//
// https://css-tricks.com/emojis-as-favicons
const DocumentTitleAndEmoji = ({ title, emoji, children }) => {

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

	React.useEffect(() => {
		if (!emoji) {
			// No-op
			return
		}
		const element = document.querySelector("link[rel='icon']")
		if (!element) {
			// No-op
			return
		}
		const originalHref = element
		element.href = (
			"data:image/svg+xml," +
				"<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>" +
					"<text y=%220.875em%22 font-size=%22100%22>" +
						emoji +
					"</text>" +
				"</svg>"
		)
		return () => {
			element.href = originalHref
		}
	}, [emoji])

	return children || null
}

export default DocumentTitleAndEmoji
