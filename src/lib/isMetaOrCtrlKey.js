// Returns whether an key down event exclusively uses the
// meta (⌘) or control (^) key.
//
// https://css-tricks.com/snippets/javascript/test-mac-pc-javascript
function isMetaOrCtrlKey(e) {
	if (navigator.userAgent.includes("Mac OS X")) {
		return !e.ctrlKey && e.metaKey
	}
	return e.ctrlKey && !e.metaKey
}

export default isMetaOrCtrlKey
