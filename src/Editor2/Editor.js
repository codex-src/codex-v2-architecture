import EditorContext from "./EditorContext"
import newPos from "./newPos"
import React from "react"
import ReactDOM from "react-dom"
import typeMap from "./typeMap"

const DEBUG = true && process.env.NODE_ENV !== "production"

// Computes a cursor data structure from a DOM node and a
// start or end range data structure.
//
// TODO (1): What’s supposed to happen if rootNode is
// outside of a data-paragraph node?
// TODO (2): Remove rootNode parameter?
function computePosFromRange(rootNode, range) {
	const pos = newPos()
	// Iterate up to to the closest data-paragraph element:
	let startNode = range.node
	while (true) {
		if (startNode.nodeType === Node.ELEMENT_NODE && startNode.getAttribute("data-paragraph")) {
			pos.id = startNode.getAttribute("id")
			break
		}
		startNode = startNode.parentNode
	}
	pos.id = startNode.id
	// Recurse to the range data structure node:
	// let offset = 0
	const recurse = startNode => {
		for (const each of startNode.childNodes) {
			if (each === range.node) {
				pos.offset += range.offset
				// Stop recursion:
				return true
			}
			pos.offset += (each.nodeValue || "").length
			if (recurse(each)) {
				// Stop recursion:
				return true
			}
		}
		// Continue recursion:
		return false
	}
	recurse(startNode, range.node)
	return pos
}

// Computes the cursor from a reference to a DOM node.
function computePos(rootNode) {
	const range = document.getSelection().getRangeAt(0)
	const rangeStart = { node: range.startContainer, offset: range.startOffset }
	const pos1 = computePosFromRange(rootNode, rangeStart)
	let pos2 = { ...pos1 }
	if (!range.collapsed) { // TODO: state.hasSelection?
		const rangeEnd = { node: range.endContainer, offset: range.endOffset }
		pos2 = computePosFromRange(rootNode, rangeEnd)
	}
	return [pos1, pos2]
}

const Editor = ({ id, tag, state, setState }) => {
	const ref = React.useRef()

	React.useEffect(() => {
		const { Provider } = EditorContext
		ReactDOM.render(
			<Provider value={[state, setState]}>
				{state.data.map(({ type: T, ...props }) => (
					React.createElement(typeMap[T], {
						key: props.id,
						...props,
					})
				))}
			</Provider>,
			ref.current,
		)
	}, [state, setState])

	return (
		<div>

			{React.createElement(
				tag || "div",
				{
					ref,

					id,

					style: {
						outline: "none",
					},

					onFocus: () => setState({ ...state, isFocused: Boolean(1) }),
					onBlur:  () => setState({ ...state, isFocused: Boolean(0) }),

					onSelect: () => {
						const [pos1, pos2] = computePos(ref.current)
						console.log(pos1, pos2)
						// dispatch.actionSelect(pos1, pos2)
					},

					contentEditable: true,
					suppressContentEditableWarning: true,
				},
			)}

			{DEBUG && (
				<div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ tabSize: 2 }}>
					{JSON.stringify(state, null, "\t")}
				</div>
			)}

		</div>
	)
}

export default Editor
