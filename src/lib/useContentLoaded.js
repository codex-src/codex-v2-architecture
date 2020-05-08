import React from "react"

// Updates when DOMContentLoaded finishes.
function useContentLoaded() {
	const [contentLoaded, setContentLoaded] = React.useState(false)
	React.useEffect(() => {
		const handler = () => {
			setContentLoaded(true)
		}
		document.addEventListener("DOMContentLoaded", handler)
		return () => {
			document.removeEventListener("DOMContentLoaded", handler)
		}
	}, [])
	return contentLoaded
}

export default useContentLoaded
