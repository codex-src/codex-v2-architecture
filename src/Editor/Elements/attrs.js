// Extraneous shared attributes.
const attrs = {
	code: {
		// https://davidwalsh.name/disable-autocorrect
		autoCapitalize: "off",
		autoComplete: "off",
		autoCorrect: "off",
		spellCheck: false,
	},
	strike: {
		style: {
			"--md-blue-a400": "currentColor",
			"textDecoration": "line-through",
			"color": "var(--gray-500)",
		},
	},
	a: {
		target: "_blank",
		rel: "noopener noreferrer",
	},
}

export default attrs
