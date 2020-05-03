// https://stackoverflow.com/a/46432113
class LRUCache {
	constructor(maxKeys) {
		Object.assign(this, {
			maxKeys,
			cache: new Map(),
		})
	}
	// Gets a value based on a key.
	get(key) {
		const value = this.cache.get(key)
		if (value) {
			this.cache.delete(key)
			this.cache.set(key, value)
		}
		return value
	}
	// Sets a value based on a key.
	set(key, value) {
		if (this.cache.has(key)) {
			this.cache.delete(key)
		} else if (this.cache.size === this.maxKeys) {
			this.cache.delete(this._lru())
		}
		this.cache.set(key, value)
	}
	// Returns the least-recently-used key; LRU.
	_lru() {
		return this.cache.keys().next().value
	}
}

export default LRUCache
