export const HTTPS = "https://"
export const HTTP = "http://"

// Matches a URL terminated by an alphanumeric (word) or
// forward-slash character.
//
// https://tools.ietf.org/html/rfc3986
//
// eslint-disable-next-line no-useless-escape
export const safeURLRe = /^([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%]*)[\w\/]/

// Returns whether a character is an ASCII punctuation
// character as defined by the GFM spec.
//
// Covers: <start> !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ <end>
//
// https://github.github.com/gfm/#ascii-punctuation-character
// https://github.github.com/gfm/#example-308
export function isASCIIPunctuation(char) {
	const ok = (
		(char >= "\u0021" && char <= "\u002f") ||
		(char >= "\u003a" && char <= "\u0040") ||
		(char >= "\u005b" && char <= "\u0060") ||
		(char >= "\u007b" && char <= "\u007e")
	)
	return ok
}

// Returns whether a character is an ASCII whitespace
// character as defined by the GFM spec.
//
// https://github.github.com/gfm/#whitespace-character
export function isASCIIWhitespace(char) {
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
