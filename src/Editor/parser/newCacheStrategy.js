// Creates a new cache strategy.
function newCacheStrategy(cachedElements) {
	// Gets and or caches an element. Parameter range can be a
	// node or a range of nodes.
	const cacheStrategy = (range, emitElement) => {
		const key = !Array.isArray(range) ? range.data : range.map(each => each.data).join("\n")
		let element = cachedElements.get(key)
		if (!element) {
			element = emitElement(range)
			cachedElements.set(key, element)
		}
		return element
	}
	return cacheStrategy
}

export default newCacheStrategy
