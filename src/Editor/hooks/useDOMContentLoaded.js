import React from "react"

// Updates on DOMContentLoaded.
export function useDOMContentLoaded() {
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

// Runs an effect on DOMContentLoaded; uses useDOMContentLoaded.
export function useDOMContentLoadedEffect(effect) {
	const contentLoaded = useDOMContentLoaded()
	React.useEffect(
		React.useCallback(() => {
			if (!contentLoaded) {
				// No-op
				return
			}
			effect()
		}, [contentLoaded, effect]),
		[contentLoaded],
	)
}
