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
			"color": "var(--gray-500)",
			"textDecoration": "line-through",
		},
	},
	a: {
		// https://mathiasbynens.github.io/rel-noopener
		target: "_blank",
		rel: "noopener noreferrer",
	},
}

export default attrs
