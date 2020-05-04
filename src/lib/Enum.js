// Maps strings to strings.
export class StringEnum {
	constructor(...keys) {
		for (const key of keys) {
			this[key] = key
		}
		Object.freeze(this)
	}
}

// Maps strings to numbers, from 0. NumberEnum is preferred
// for performant code.
export class NumberEnum {
	constructor(...keys) {
		for (let x = 0; x < keys.length; x++) {
			this[keys[x]] = x
		}
		Object.freeze(this)
	}
}
