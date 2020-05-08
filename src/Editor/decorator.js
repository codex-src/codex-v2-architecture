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

				// Check handler for synthetic checkboxes.
				const checkTodo = id => {
					// NOTE: document.activeElement.blur and
					// selection.removeAllRanges do not remove the
					// selection in Firefox
					//
					document.activeElement.blur()
					dispatch.checkTodo(id)
					each.focus()
				}

				each.onpointerdown = e => {
					e.preventDefault()
					checkTodo(id)
				}
				// Custom space handler; prevents Firefox from
				// scrolling.
				each.onkeydown = e => {
					if (e.keyCode !== keyCodeSpace) {
						// No-op
						return
					}
					checkTodo(id)
				}
			}
		}
	}
	return decorate
}

export default decorator
