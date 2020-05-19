// https://github.github.com/gfm/#list-items
// https://github.github.com/gfm/#task-list-items-extension
export const AnyListRegex = /^(\t*)(- \[(?: |x)\] |[-*] |\d+\. )/

// ![Image](src)
//
// https://regex101.com/r/FBKxEO/1
export const StrictImageRegex = /^!\[([^]*)\]\(([^)]+)\)$/

// [![Image](src)](href)
//
// https://regex101.com/r/FBKxEO/2
export const StrictLinkedImageRegex = /^\[!\[([^]*)\]\(([^)]+)\)\]\(([^)]+)\)$/

// (https?://)(www.)?(<URI>)?
//
// https://tools.ietf.org/html/rfc3986 [Page 49]
export const URLRegex = /^(https?:\/\/(?:www\.)?)([\w-.~:/?#[\]@!$&'()*+,;=%]+)?/
