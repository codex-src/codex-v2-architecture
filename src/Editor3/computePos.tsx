import { newPos } from "./constructors"

type Range = {
	node: Node,
	offset: number,
}

// Counts the offset from an element to a node.
function countOffset(element: HTMLElement, node: Node) {
	let offset = 0
	// console.log(element, node)
	const recurse = (on: Node) => {
		if (on === node) {
			return true
		}
		for (const each of on.childNodes) {
			if (recurse(each)) {
				return true
			}
			offset += (each.nodeValue || "").length
			if (each.nodeType === Node.ELEMENT_NODE) {
				const next = (each as HTMLElement).nextElementSibling
				if (next && next.getAttribute("data-node")) {
					offset++
				}
			}
		}
		return false
	}
	recurse(element)
	return offset
}

// Computes a cursor data structure from a range data
// structure.
function computePosFromRange(editorRoot: HTMLElement, { ...range }: Range) {
	const pos = newPos()
	if (!range.node || !editorRoot.contains(range.node)) {
		throw new Error("computePosFromRange: no such node or out of bounds")
	}
	// Iterate range.node to the deepest node:
	while (range.node.nodeType === Node.ELEMENT_NODE && range.node.childNodes.length) {
		range.node = range.node.childNodes[range.offset]
		range.offset = 0
	}
	// Compute pos.node.id; ascend to the nearest data-node or
	// data-root element:
	let node = range.node // eslint-disable-line prefer-destructuring
	while (true) {
		if (node.nodeType === Node.ELEMENT_NODE && (
			(node as HTMLElement).getAttribute("data-node") ||
			(node as HTMLElement).getAttribute("data-root")
		)) {
			// No-op
			break
		}
		node = node.parentElement!
	}
	pos.node.id = (node as HTMLElement).id
	// Compute pos.root.id; ascend to the nearest data-root
	// element:
	const root = node
	while (true) {
		if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).getAttribute("data-root")) {
			// No-op
			break
		}
		node = node.parentElement!
	}
	pos.root.id = (root as HTMLElement).id
	// Compute the offset from node and root to range.node:
	pos.node.offset = countOffset((node as HTMLElement), range.node) + range.offset
	pos.root.offset = countOffset((root as HTMLElement), range.node) + range.offset
	// Done:
	return pos
}

// Computes cursor data structures.
function computePos(editorRoot: HTMLElement) {
	const selection = document.getSelection()
	if (!selection) {
		throw new Error("computePos: no such selection")
	}
	const range = selection.getRangeAt(0)
	const r1 = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePosFromRange(editorRoot, r1)
	let pos2 = { ...pos1 }
	if (!range.collapsed) {
		const r2 = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePosFromRange(editorRoot, r2)
	}
	return [pos1, pos2]
}

export default computePos
