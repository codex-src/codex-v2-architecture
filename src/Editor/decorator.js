// Returns a new decorator function for the return of
// deeplySyncNodes.
function decorator(state, dispatch) {
	const decorate = syncedNodes => {
		for (const each of syncedNodes) {
			if (each.nodeType !== Node.ELEMENT_NODE || (each.nodeName !== "UL" && each.nodeName !== "OL")) {
				// No-op
				continue
			}
			const todo = each.querySelectorAll("[data-codex-node] > .absolute > [data-codex-checkbox]")
			for (const each of todo) {
				const { id } = each.parentElement.parentElement
				each.onpointerdown = e => {
					e.preventDefault()
				}
				each.onclick = () => {
					// Blur to prevent auto-scrolling:
					document.activeElement.blur()
					dispatch.checkTodo(id)
					each.focus()
				}
			}
		}
	}
	return decorate
}

export default decorator
