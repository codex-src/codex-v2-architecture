// https://stackoverflow.com/a/6672823
class Enum {
	constructor(...keys) {
		// keys.map(each => this[each] = each)
		for (const key of keys) {
			this[key] = key
		}
		Object.assign(this, { __keys: keys })
		Object.freeze(this)
	}
	keys() {
		return this.__keys
	}
}

export default Enum
