const keyCodeSpace = 32

// Returns a new decorator function for the return of
// deeplySyncNodes.
function decorator(state, dispatch) {
	const decorate = syncedElements => {
		for (const each of syncedElements) {
			if (each.nodeName !== "UL" && each.nodeName !== "OL") {
				// No-op
				continue
			}
			const checkboxes = each.querySelectorAll("[data-codex-node] > .absolute > [data-codex-checkbox]")
			for (const each of checkboxes) {
				const { id } = each.parentElement.parentElement
				const toggleCheck = () => {
					// TODO: Use selection.removeAllRanges instead?
					document.activeElement.blur()
					dispatch.checkTodo(id)
					each.focus()
				}
				each.onpointerdown = e => {
					e.preventDefault()
					toggleCheck()
				}
				// Custom space handler; prevents Firefox from
				// scrolling.
				each.onkeydown = e => {
					if (e.keyCode !== keyCodeSpace) {
						// No-op
						return
					}
					e.preventDefault()
					toggleCheck()
				}
			}
		}
	}
	return decorate
}

export default decorator
