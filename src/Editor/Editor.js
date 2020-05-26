// import computeScrollingElementAndOffset from "./computeScrollingElementAndOffset"
import detectKeyDownTypes from "./keydown/detectKeyDownTypes"
import keyDownTypesEnum from "./keydown/keyDownTypesEnum"
import noopTextContent from "./noopTextContent"
import React from "react"
import ReactDOM from "react-dom"
import readCurrentPos from "./readCurrentPos"
import syncPos from "./syncPos"
import typeEnumArray from "./Elements/typeEnumArray"
import useDOMContentLoaded from "lib/useDOMContentLoaded"
import { readCurrentDocumentNode } from "./documentNodes/read"

import "./stylesheets/core.css"
import "./stylesheets/form-checkbox.css"
import "./stylesheets/theme.css"

;(() => {
	noopTextContent()
})()

const ReactElements = ({ state, dispatch }) => (
	state.elements.map(({ type: T, ...each }) => (
		React.createElement(typeEnumArray[T], {
			key: each.reactKey || each.id,
			...each,
			dispatch,
		})
	))
)

const Editor = ({
	id,
	className,
	style,
	state,
	dispatch,
	readOnly,
	autoFocus,
	scrollTopOffset,
	scrollBottomOffset,
}) => {
	const ref = React.useRef()

	const pointerDownRef = React.useRef(false)

	// https://github.com/w3c/uievents/issues/202#issue-316461024
	const dedupedFirefoxCompositionEnd = React.useRef(false)

	// Syncs props to state.
	React.useEffect(() => {
		dispatch.registerProps({ readOnly, autoFocus })
	}, [readOnly, autoFocus, dispatch])

	// Renders VDOM to the DOM.
	React.useLayoutEffect(
		React.useCallback(() => {
			const selection = document.getSelection()
			if (selection.rangeCount) {
				selection.removeAllRanges()
			}
			const t = Date.now()
			ReactDOM.render(<ReactElements state={state} dispatch={dispatch} />, ref.current, () => {
				console.log("ReactDOM.render", Date.now() - t)
				if (state.readOnly || !state.focused) {
					// No-op
					return
				}

				try {
					const t = Date.now()
					syncPos(state)
					console.log("syncPos", Date.now() - t)
				} catch (error) {
					console.error(error)
				}

				// setTimeout(() => {
				// 	const computed = computeScrollingElementAndOffset(scrollTopOffset, scrollBottomOffset)
				// 	if (!computed || !computed.offset) {
				// 		// No-op
				// 		return
				// 	}
				// 	const { scrollingElement, offset } = computed
				// 	scrollingElement.scrollBy(0, offset)
				// }, 0)
			})
		}, [state, dispatch]),
		[state.readOnly, state.elements],
	)

	const DOMContentLoaded = useDOMContentLoaded()

	// Rerenders on DOMContentLoaded.
	//
	// TODO: No-op for whent there are no <Preformatted>
	// elements
	React.useEffect(
		React.useCallback(() => {
			if (!DOMContentLoaded) {
				// No-op
				return
			}
			dispatch.render()
		}, [DOMContentLoaded, dispatch]),
		[DOMContentLoaded],
	)

	// Pushes the next undo (debounced).
	React.useEffect(
		React.useCallback(() => {
			if (state.readOnly) {
				// No-op
				return
			}
			const id = setTimeout(dispatch.pushUndo, 250)
			return () => {
				clearTimeout(id)
			}
		}, [state, dispatch]),
		[state.readOnly, state.data],
	)

	// Exclusively returns a function for read-write mode.
	const newReadWriteHandler = handler => {
		if (!state.readOnly) {
			return handler
		}
		return undefined
	}

	return (
		<>

			{React.createElement(
				"div",
				{
					ref,

					id,

					className: `em-context codex-editor ${
						!state.readOnly ? "" : "feature-read-only"
					} ${
						className || ""
					}`.trim(),

					style: {
						...style, // Takes precedence
						whiteSpace: "pre-wrap",
						outline: "none",
						wordBreak: "break-word",
					},

					"data-codex-editor": true,

					onFocus: newReadWriteHandler(() => {
						dispatch.focus()
					}),

					onBlur: newReadWriteHandler(() => {
						dispatch.blur()
					}),

					onSelect: newReadWriteHandler(() => {
						const selection = document.getSelection()
						if (!selection.rangeCount) {
							// No-op
							return
						}
						// COMPAT (FF): Guard document-range:
						const range = selection.getRangeAt(0)
						if (range.startContainer === ref.current && range.endContainer === ref.current) {
							// Iterate to the deepest start node:
							let node1 = ref.current.children[0]
							while (node1.childNodes.length) {
								node1 = node1.childNodes[0]
							}
							// Iterate to the deepest end node:
							let node2 = ref.current.children[ref.current.children.length - 1]
							while (node2.childNodes.length) {
								node2 = node2.childNodes[node2.childNodes.length - 1]
							}
							range.setStartBefore(node1)
							range.setEndAfter(node2)
							selection.removeAllRanges()
							selection.addRange(range)
						}
						const [pos1, pos2] = readCurrentPos(state)
						dispatch.select(pos1, pos2)
					}),

					onPointerDown: newReadWriteHandler(() => {
						pointerDownRef.current = true
					}),

					onPointerMove: newReadWriteHandler(() => {
						if (!state.focused || !pointerDownRef.current) {
							pointerDownRef.current = false
							return
						}
						const [pos1, pos2] = readCurrentPos(state)
						dispatch.select(pos1, pos2)
					}),

					onPointerUp: newReadWriteHandler(() => {
						pointerDownRef.current = false
					}),

					onKeyDown: newReadWriteHandler(e => {
						switch (detectKeyDownTypes(e)) {
						case keyDownTypesEnum.tab:
							if (e.target.nodeName === "INPUT" && e.target.type === "checkbox") {
								// No-op
								return
							}
							e.preventDefault()
							dispatch.tab(e.shiftKey)
							return
						case keyDownTypesEnum.enter:
							e.preventDefault()
							dispatch.enter()
							return
						case keyDownTypesEnum.formatEm:
							e.preventDefault()
							// TODO
							return
						case keyDownTypesEnum.formatStrong:
							e.preventDefault()
							// TODO
							return
						case keyDownTypesEnum.backspaceParagraph:
							e.preventDefault()
							dispatch.backspaceParagraph()
							return
						case keyDownTypesEnum.backspaceWord:
							e.preventDefault()
							dispatch.backspaceWord()
							return
						case keyDownTypesEnum.backspaceRune:
							e.preventDefault()
							dispatch.backspaceRune()
							return
						case keyDownTypesEnum.forwardBackspaceWord:
							dispatch.forwardBackspaceWord()
							e.preventDefault()
							return
						case keyDownTypesEnum.forwardBackspaceRune:
							e.preventDefault()
							dispatch.forwardBackspaceRune()
							return
						case keyDownTypesEnum.undo:
							e.preventDefault()
							dispatch.undo()
							return
						case keyDownTypesEnum.redo:
							e.preventDefault()
							dispatch.redo()
							return
						// NOTE: Character data must be synthetic when not
						// collapsed
						case keyDownTypesEnum.characterData:
							if (!state.collapsed) {
								e.preventDefault()
								// FIXME: e.key === "Dead" causes
								// readCurrentPos to throw
								dispatch.write(e.key !== "Dead" ? e.key : "") // TODO: Deprecate "Dead" case
								return
							}
							// No-op
							break
						default:
							// No-op
							break
						}
					}),

					onCompositionEnd: newReadWriteHandler(e => {
						if (!ref.current.children.length) {
							dispatch.render()
							return
						}

						dedupedFirefoxCompositionEnd.current = true

						const data = readCurrentDocumentNode(state)
						const [pos1] = readCurrentPos(state)

						// COMPAT (FF): Backspace during a composition
						// event can create an empty text node; **REMOVE
						// THE SELECTION AND DESTROY THE TEXT NODE**:
						const textNodes = []
						for (const each of ref.current.childNodes) {
							if (each.nodeType === Node.TEXT_NODE) {
								textNodes.push(each)
							}
						}
						if (textNodes.length) {
							const selection = document.getSelection()
							if (selection.rangeCount) {
								selection.removeAllRanges()
							}
							for (const each of textNodes) {
								each.remove()
							}
							pos1 = state.pos1
						}

						const renderOpts = { preventRerender: false, forceRerender: true }
						dispatch.input(data, pos1, renderOpts)
					}),

					onInput: newReadWriteHandler(e => {
						// No-op onChange events from <TodoItem>:
						if (e.target.nodeName === "INPUT" && e.target.type === "checkbox") {
							// No-op
							return
						// No-op deduped onCompositionEnd event:
						} else if (dedupedFirefoxCompositionEnd.current) {
							dedupedFirefoxCompositionEnd.current = false
							return
						}

						// Force rerender:
						if (!ref.current.children.length) {
							dispatch.render()
							return
						}

						const data = readCurrentDocumentNode(state)
						const [pos1] = readCurrentPos(state)

						const renderOpts = { preventRerender: e.nativeEvent.isComposing, forceRerender: true }
						dispatch.input(data, pos1, renderOpts)
					}),

					onCut: newReadWriteHandler(e => {
						e.preventDefault()
						if (state.collapsed) {
							// No-op
							return
						}
						const cutData = state.data.slice(state.pos1.pos, state.pos2.pos)
						e.clipboardData.setData("text/plain", cutData)
						dispatch.cut()
					}),

					onCopy: newReadWriteHandler(e => {
						e.preventDefault()
						if (state.collapsed) {
							// No-op
							return
						}
						const copyData = state.data.slice(state.pos1.pos, state.pos2.pos)
						e.clipboardData.setData("text/plain", copyData)
						dispatch.copy()
					}),

					onPaste: newReadWriteHandler(e => {
						e.preventDefault()
						const pasteData = e.clipboardData.getData("text/plain")
						if (!pasteData) {
							// No-op
							return
						}
						dispatch.paste(pasteData)
					}),

					onDragStart: newReadWriteHandler(e => {
						e.preventDefault()
					}),

					contentEditable: !state.readOnly,
					suppressContentEditableWarning: !state.readOnly,
				},
			)}

			{/* <pre className="text-sm" style={{ tabSize: 2, MozTabSize: 2 }}> */}
			{/* 	{JSON.stringify({ */}
			{/* 		data: state.data, */}
			{/* 		// nodes: state.nodes, */}
			{/* 		elements: state.elements, */}
			{/* 	}, null, "\t")} */}
			{/* </pre> */}

		</>
	)
}

export default Editor
