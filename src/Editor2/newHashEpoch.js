// Creates a new hash epoch for URL hashes.
function newHashEpoch() {
	const hashes = {}
	const newHash = str => {
		// ALPHA / DIGIT / "-" / "." / "_" / "~"
		//
		// https://tools.ietf.org/html/rfc3986
		//
		/* eslint-disable no-useless-escape */
		const hash = str
			.toLowerCase()               // Lowercase
			.replace(/(\s+|\-+)/g, "-")  // Convert spaces to dashes
			.replace(/[^a-z0-9\-]/g, "") // Remove non-alphanumerics (strict)
			.replace(/\-+/g, "-")        // Remove extraneous dashes (1 of 2)
			.replace(/(^\-|\-$)/g, "")   // Remove extraneous dashes (2 of 2)
		/* eslint-enable no-useless-escape */
		const seen = hashes[hash]
		if (!seen) {
			hashes[hash] = 0
		}
		hashes[hash]++
		return hash + (!seen ? "" : `-${hashes[hash]}`)
	}
	return newHash
}

export default newHashEpoch
