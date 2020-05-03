import { AnyListRe } from "./parseAnyList"

// Tests whether a node is a header node.
export function testHeader(node) {
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

// Tests whether a node is a blockquote node.
export function testBlockquote(node) {
	const syntax = node.data.slice(0, 2)
	const ok = (
		syntax === "> " ||
		syntax === ">"
	)
	return ok
}

// Tests whether a node is a preformatted (start) node.
export function testPreformattedStart(node) {
	const syntax = node.data.slice(0, 3)
	const ok = (
		syntax === "```" ||
		syntax === "~~~"
	)
	return ok
}

// Tests whether a node is a preformatted (end) node.
export function testPreformattedEnd(node, syntax) {
	return node.data === syntax
}

// Tests whether a node is an <AnyList> node.
export function testAnyList(node) {
	return AnyListRe.test(node.data)
}

// Tests whether a node is a break node.
export function testBreak(node) {
	return node.data === "---" || node.data === "***" /* || node.data === "___" */
}
