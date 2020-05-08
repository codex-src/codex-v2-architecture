import React from "react"

// Updates on DOMContentLoaded.
function useDOMContentLoaded() {
	const [DOMContentLoaded, setDOMContentLoaded] = React.useState(false)
	React.useEffect(() => {
		const handler = () => {
			setDOMContentLoaded(true)
		}
		document.addEventListener("DOMContentLoaded", handler)
		return () => {
			document.removeEventListener("DOMContentLoaded", handler)
		}
	}, [])
	return DOMContentLoaded
}

export default useDOMContentLoaded

// // Runs an effect on DOMContentLoaded; uses useDOMContentLoaded.
// export function useDOMContentLoadedEffect(effect) {
// 	const DOMContentLoaded = useDOMContentLoaded()
// 	React.useEffect(
// 		React.useCallback(() => {
// 			if (!DOMContentLoaded) {
// 				// No-op
// 				return
// 			}
// 			effect()
// 		}, [DOMContentLoaded, effect]),
// 		[DOMContentLoaded],
// 	)
// }
