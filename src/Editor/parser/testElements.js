import { AnyListRegex } from "../regexes"

// TODO: Add testElements.Image?
const testElements = {
	Header({ data }) {
		const ok = (
			data.startsWith("# ") ||
			data.startsWith("## ") ||
			data.startsWith("### ") ||
			data.startsWith("#### ") ||
			data.startsWith("##### ") ||
			data.startsWith("###### ")
		)
		return ok
	},
	Blockquote({ data }) {
		const ok = (
			data.startsWith("> ") ||
			data === ">"
		)
		return ok
	},
	PreformattedStart({ data }) {
		const ok = (
			(data.startsWith("```") && data.slice(3).indexOf("`") === -1) ||
			(data.startsWith("~~~") && data.slice(3).indexOf("~") === -1)
		)
		return ok
	},
	PreformattedEnd({ data }, syntax) {
		return data === syntax
	},
	AnyList({ data }) {
		return AnyListRegex.test(data)
	},
	Break({ data }) {
		const ok = (
			data === "---" ||
			data === "***" ||
			data === "___"
		)
		return ok
	},
}

export default testElements
