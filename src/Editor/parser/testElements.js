import { AnyListRegex } from "./spec"

// TODO: Add testElements.Image?
const testElements = {
	Header({ data }) {
		const ok = (
			data.slice(0, 2) === "# " ||
			data.slice(0, 3) === "## " ||
			data.slice(0, 4) === "### " ||
			data.slice(0, 5) === "#### " ||
			data.slice(0, 6) === "##### " ||
			data.slice(0, 7) === "###### "
		)
		return ok
	},
	Blockquote({ data }) {
		const ok = (
			data.slice(0, 2) === "> " ||
			data === ">"
		)
		return ok
	},
	PreformattedStart({ data }) {
		const ok = (
			data.slice(0, 3) === "```" ||
			data.slice(0, 3) === "~~~"
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
			data === "***" // ||
			// data === "___"
		)
		return ok
	},
}

export default testElements
