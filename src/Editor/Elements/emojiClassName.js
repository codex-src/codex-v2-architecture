import typeEnum from "./typeEnum"

// Returns an `emojis--${count}` class name.
function emojiClassName(children) {
	const count = (
		children &&
		children.every &&
		children.every(each => (
			each &&
			each.type &&
			each.type === typeEnum.Emoji
		)) &&
		children.length
	)
	return !count ? undefined : `emojis--${count}`
}

export default emojiClassName
