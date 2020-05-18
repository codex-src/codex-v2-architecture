import { AnyListRe } from "./spec"

export function Header(node) {
	const ok = (
		node.data.slice(0, 2) === "# " ||
		node.data.slice(0, 3) === "## " ||
		node.data.slice(0, 4) === "### " ||
		node.data.slice(0, 5) === "#### " ||
		node.data.slice(0, 6) === "##### " ||
		node.data.slice(0, 7) === "###### "
	)
	return ok
}

export function Blockquote(node) {
	const syntax = node.data.slice(0, 2)
	const ok = (
		syntax === "> " ||
		syntax === ">"
	)
	return ok
}

export function PreformattedStart(node) {
	const syntax = node.data.slice(0, 3)
	const ok = (
		syntax === "```" ||
		syntax === "~~~"
	)
	return ok
}

export function PreformattedEnd(node, syntax) {
	return node.data === syntax
}

export function AnyList(node) {
	return AnyListRe.test(node.data)
}

export function Break(node) {
	return node.data === "---" || node.data === "***" /* || node.data === "___" */
}
