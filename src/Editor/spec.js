/* eslint-disable no-multi-spaces */
export const HTTPS = "https://"
export const HTTP  = "http://"
/* eslint-enable no-multi-spaces */

// Matches a URL terminated by an alphanumeric (word) or
// forward-slash character.
//
// https://tools.ietf.org/html/rfc3986
export const safeURLRe = /^([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%]*)/ // eslint-disable-line no-useless-escape

// Returns whether a character is an ASCII punctuation
// character as defined by the GFM spec.
//
// https://github.github.com/gfm/#ascii-punctuation-character
// https://github.github.com/gfm/#example-308
export const ASCIIPunctuationPattern = "[\\u0021-\\u002f\\u003a-\\u0040\\u005b-\\u0060\\u007b-\\u007e]"

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
export const ASCIIWhitespacePattern = "[\\u0020\\u0009\\u000a\\u000b\\u000c\\u000d]"

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
