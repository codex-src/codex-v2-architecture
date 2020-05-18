// Trims extraneous white space.
function trimWhiteSpace(str) {
	return str.split(/\s+/).filter(Boolean).join(" ")
}

export default trimWhiteSpace
