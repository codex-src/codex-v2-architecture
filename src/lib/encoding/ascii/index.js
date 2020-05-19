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

// https://github.github.com/gfm/#ascii-punctuation-character
export function isPunctuation(char) {
	const ok = (
		(char >= "\u0021" && char <= "\u002f") ||
		(char >= "\u003a" && char <= "\u0040") ||
		(char >= "\u005b" && char <= "\u0060") ||
		(char >= "\u007b" && char <= "\u007e")
	)
	return ok
}

// https://github.github.com/gfm/#whitespace-character
export function isWhiteSpace(char) {
	const ok = (
		char === "\u0020" ||
		char === "\u0009" ||
		char === "\u000a" ||
		char === "\u000b" ||
		char === "\u000c" ||
		char === "\u000d"
	)
	return ok
}
