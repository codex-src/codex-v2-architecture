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
				each.onpointerdown = e => {
					e.preventDefault()
					// Blur to prevent auto-scrolling:
					document.activeElement.blur()
					dispatch.checkTodo(id)
					each.focus()
				}
				// each.onclick = () => {
				// 	// Blur to prevent auto-scrolling:
				// 	document.activeElement.blur()
				// 	dispatch.checkTodo(id)
				// 	each.focus()
				// }
			}
		}
	}
	return decorate
}

export default decorator
