// Extraneous shared attributes.
const attrs = {
	code: {
		style: {
			MozTabSize: 2,
			tabSize: 2,
		},
		spellCheck: false,
	},
	strike: {
		style: {
			"--red-100": "var(--gray-100)",
			"--red-600": "currentColor",
			"--md-blue-a400": "currentColor",
			"textDecoration": "line-through",
			"color": "var(--gray-500)",
		},
	},
	a: {
		target: "_blank",
		rel: "noopener noreferrer",
	},
	li: {
		style: {
			MozTabSize: 0,
			tabSize: 0,
			fontFeatureSettings: "'tnum'",
		},
	},
}

export default attrs
