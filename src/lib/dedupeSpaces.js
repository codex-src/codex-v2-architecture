// Dedupes spaces.
function dedupeSpaces(str) {
	return str.split(/\s+/).filter(Boolean).join(" ")
}

export default dedupeSpaces
