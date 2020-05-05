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
			"--blue-100": "var(--gray-100)",
			"--blue-500": "currentColor",
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
