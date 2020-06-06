const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
	purge: [
		"./public/**/*.html",
		"./src/**/*.js",
	],
	theme: {
		extend: {
			boxShadow: {
				"hero-sm":  "0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				hero:       "0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
				"hero-md":  "0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				"hero-lg":  "0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
				"hero-xl":  "0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
				"hero-2xl": "0 0 0 1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.25)",
			},
			fontFamily: {
				sans: [
					"-apple-system",
					"BlinkMacSystemFont",
					"Inter",
					...defaultTheme.fontFamily.sans,
				],
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
	plugins: [
		require("@tailwindcss/ui"),
	],
}
