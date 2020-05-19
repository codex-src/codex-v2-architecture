// Returns whether a character is strictly an alphanumeric
// character (negates underscores "_").
export function isStrictAlphanum(char) {
	const ok = (
		(char >= "a" && char <= "z") ||
		(char >= "A" && char <= "Z") ||
		(char >= "0" && char <= "9")
	)
	return ok
}

// Returns whether a character is an alphanumeric character.
export function isAlphanum(char) {
	const ok = (
		(char >= "a" && char <= "z") ||
		(char >= "A" && char <= "Z") ||
		(char >= "0" && char <= "9") ||
		char === "_"
	)
	return ok
}
