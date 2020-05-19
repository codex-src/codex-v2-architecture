// https://github.github.com/gfm/#ascii-punctuation-character
export const ASCIIPunctuationRegex = /[\u0021-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007e]/

// https://github.github.com/gfm/#whitespace-character
export const ASCIIWhiteSpaceRegex = /[\u0020\u0009\u000a\u000b\u000c\u000d]/

// https://github.github.com/gfm/#list-items
// https://github.github.com/gfm/#task-list-items-extension
export const AnyListRegex = /^(\t*)(- \[(?: |x)\] |[-*] |\d+\. )/

// https://tools.ietf.org/html/rfc3986
export const URIRegex = /^([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\%]*)/ // eslint-disable-line no-useless-escape
