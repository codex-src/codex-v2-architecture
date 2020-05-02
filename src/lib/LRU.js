// https://stackoverflow.com/a/46432113
class LRU {
	// Returns a new LRU cache.
	constructor(limit) {
		// this.limit = limit // The max number of keys.
		// this.cache = new Map()
		Object.assign(this, {
			limit,
			cache: new Map(),
		})
	}
	// Gets a value based on a key.
	get(key) {
		const value = this.cache.get(key)
		if (value) {
			// Refresh:
			this.cache.delete(key)
			this.cache.set(key, value)
		}
		return value
	}
	// Sets a value based on a key.
	set(key, value) {
		if (this.cache.has(key)) {
			// Refresh:
			this.cache.delete(key)
		} else if (this.cache.size === this.limit) {
			// Purge:
			this.cache.delete(this._lru())
		}
		this.cache.set(key, value)
	}
	// Returns the least recently used key; LRU.
	_lru() {
		return this.cache.keys().next().value
	}
}
