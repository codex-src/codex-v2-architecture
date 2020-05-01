// https://stackoverflow.com/a/39914235
function timeout(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export default timeout
