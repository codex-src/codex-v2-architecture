module.exports = {
	purge: [
		"./public/**/*.html",
		"./src/**/*.js",
	],
	theme: {
		extend: {
			boxShadow: {
				"hero-sm": `
					0 0 0 1px rgba(0, 0, 0, 0.05),
					0 1px 2px 0 rgba(0, 0, 0, 0.05)
				`,
				"hero": `
					0 0 0 1px rgba(0, 0, 0, 0.05),
					0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
				`,
				"hero-md": `
					0 0 0 1px rgba(0, 0, 0, 0.05),
					0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
				`,
				"hero-lg": `
					0 0 0 1px rgba(0, 0, 0, 0.05),
					0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
				`,
				"hero-xl": `
					0 0 0 1px rgba(0, 0, 0, 0.05),
					0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
				`,
				"hero-2xl": `
					0 0 0 1px rgba(0, 0, 0, 0.05),
					0 25px 50px -12px rgba(0, 0, 0, 0.25)
				`,
			},
			// https://gist.github.com/codex-zaydek/d3d1803f981fc8ed75fc0e4f481f6ecc
			colors: {
				"md-blue-50":   { default: "var(--md-blue-50)"   },
				"md-blue-100":  { default: "var(--md-blue-100)"  },
				"md-blue-200":  { default: "var(--md-blue-200)"  },
				"md-blue-300":  { default: "var(--md-blue-300)"  },
				"md-blue-400":  { default: "var(--md-blue-400)"  },
				"md-blue-500":  { default: "var(--md-blue-500)"  },
				"md-blue-600":  { default: "var(--md-blue-600)"  },
				"md-blue-700":  { default: "var(--md-blue-700)"  },
				"md-blue-800":  { default: "var(--md-blue-800)"  },
				"md-blue-900":  { default: "var(--md-blue-900)"  },
				"md-blue-a100": { default: "var(--md-blue-a100)" },
				"md-blue-a200": { default: "var(--md-blue-a200)" },
				"md-blue-a400": { default: "var(--md-blue-a400)" },
				"md-blue-a700": { default: "var(--md-blue-a700)" },
				"md-gray-50":   { default: "var(--md-gray-50)"   },
				"md-gray-100":  { default: "var(--md-gray-100)"  },
				"md-gray-200":  { default: "var(--md-gray-200)"  },
				"md-gray-300":  { default: "var(--md-gray-300)"  },
				"md-gray-400":  { default: "var(--md-gray-400)"  },
				"md-gray-500":  { default: "var(--md-gray-500)"  },
				"md-gray-600":  { default: "var(--md-gray-600)"  },
				"md-gray-700":  { default: "var(--md-gray-700)"  },
				"md-gray-800":  { default: "var(--md-gray-800)"  },
				"md-gray-900":  { default: "var(--md-gray-900)"  },
			},
		},
		// https://tailwindcss.com/docs/breakpoints
		screens: {
			xs: `${24 + 512 + 24}px`,
			// => @media (min-width: 560px) { ... }

			sm: `${24 + 640 + 24}px`,
			// => @media (min-width: 688px) { ... }

			md: `${24 + 768 + 24}px`,
			// => @media (min-width: 816px) { ... }

			lg: `${24 + 1024 + 24}px`,
			// => @media (min-width: 1072px) { ... }

			xl: `${24 + 1280 + 24}px`,
			// => @media (min-width: 1328px) { ... }
		},
	},
	variants: {},
	plugins: [],
}
