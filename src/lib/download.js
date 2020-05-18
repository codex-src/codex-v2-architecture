import React from "react"
import renderDOM from "lib/renderDOM"

// Downloads a file to the local filesystem. Parameters blob
// and options passthrough to window.URL.createObjectURL.
function download(filename, blob, options) {
	const href = window.URL.createObjectURL(blob, options)
	// eslint-disable-next-line jsx-a11y/anchor-has-content
	const anchor = renderDOM(<a href={href} style={{ display: "none" }} download={filename} />)
	document.body.appendChild(anchor)
	anchor.click()
	window.URL.revokeObjectURL(href)
}

export default download
