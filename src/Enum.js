// https://stackoverflow.com/a/6672823
class Enum {
	constructor(...keys: string[]) {
		for (const key of keys) {
			this[key] = key
		}
		Object.freeze(this)
	}
}

export default Enum
