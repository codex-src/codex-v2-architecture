import computeNodes from "./computeNodes"
import computePosRange from "./computePosRange"
import computeScrollingElementAndOffset from "./computeScrollingElementAndOffset"
import detectKeyDownType from "./detectKeyDownType"
import EditorContext from "./EditorContext"
import keyDownTypeEnum from "./keyDownTypeEnum"
import React from "react"
import ReactDOM from "react-dom"
import syncPos from "./syncPos"
import trimWhiteSpace from "lib/trimWhiteSpace"
import typeEnumArray from "./Elements/typeEnumArray"
import useDOMContentLoaded from "lib/useDOMContentLoaded"
import uuidv4 from "uuid/v4"

import "./Editor.css"

const Elements = ({ state, dispatch }) => {
	const { Provider } = EditorContext
	return (
		<Provider value={[state, dispatch]}>
			{state.elements.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					// FIXME
					key: uuidv4(),
					// key: each.id,
					...each,
				})
			))}
		</Provider>
	)
}

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

	const pointerDownRef = React.useRef()
	const dedupedCompositionEnd = React.useRef()

	// Syncs props to state.
	React.useEffect(() => {
		dispatch.registerProps({ readOnly, autoFocus })
	}, [readOnly, autoFocus, dispatch])

	// Renders VDOM to the DOM.
	React.useLayoutEffect(
		React.useCallback(() => {
			// Eagerly drop selection for performance reasons:
			//
			// https://bugs.chromium.org/p/chromium/issues/detail?id=138439#c10
			const selection = document.getSelection()
			if (selection && selection.rangeCount) {
				selection.removeAllRanges()
				// NOTE: Use document.activeElement.blur for
				// checkboxes
				if (document.activeElement) { // TODO: Remove guard?
					document.activeElement.blur()
				}
			}
			ReactDOM.render(<Elements state={state} dispatch={dispatch} />, ref.current, () => {
				if (state.readOnly || !state.focused) {
					// No-op
					return
				}
				// Sync DOM cursors:
				try {
					syncPos(state, ref.current, [state.pos1, state.pos2])
				} catch (error) {
					console.error(error)
					return
				}
				// Mocks scrollIntoViewIfNeeded.
				const id = setTimeout(() => {
					const computed = computeScrollingElementAndOffset((scrollTopOffset || 0), (scrollBottomOffset || 0))
					if (!computed || !computed.offset) {
						// No-op
						return
					}
					const { scrollingElement, offset } = computed
					scrollingElement.scrollBy(0, offset)
				}, 0)
				return () => {
					clearTimeout(id)
				}
			})
		}, [state, dispatch, scrollTopOffset, scrollBottomOffset]),
		[state.readOnly, state.elements],
	)

	const DOMContentLoaded = useDOMContentLoaded()

	// Rerenders on DOMContentLoaded.
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
		<div>

			{React.createElement(
				"div",
				{
					ref,

					id,

					className: trimWhiteSpace(`em-context codex-editor ${!state.readOnly ? "" : "feature-read-only"} ${className || ""}`),

					style: {
						...style, // Takes precedence
						whiteSpace: "pre-wrap",
						outline: "none",
						wordBreak: "break-word",
					},

					onFocus: newReadWriteHandler(() => {
						dispatch.focus()
					}),

					onBlur: newReadWriteHandler(() => {
						dispatch.blur()
					}),

					onSelect: newReadWriteHandler(() => {
						const selection = document.getSelection()
						if (!selection || !selection.rangeCount) {
							// No-op
							return
						}
						// // Guard out of bounds range:
						// const range = selection.getRangeAt(0)
						// if (range.startContainer === ref.current || range.endContainer === ref.current) {
						// 	// Iterate to the deepest start node:
						// 	let node1 = ref.current.childNodes[0]
						// 	while (node1.childNodes.length) {
						// 		node1 = node1.childNodes[0]
						// 	}
						//
						// 	// // Iterate to the deepest end node:
						// 	// let node2 = ref.current.childNodes[ref.current.childNodes.length - 1]
						// 	// while (node2.childNodes.length) {
						// 	// 	node2 = node2.childNodes[node2.childNodes.length - 1]
						// 	// }
						//
						// 	// Correct range:
						// 	range.setStart(node1, 0)
						// 	// range.setEnd(node2, (node2.nodeValue || "").length)
						// 	range.collapse()
						// 	selection.removeAllRanges()
						// 	selection.addRange(range)
						// }
						const [pos1, pos2] = computePosRange(state, ref.current)
						dispatch.select(pos1, pos2)
					}),

					onPointerDown: newReadWriteHandler(() => {
						pointerDownRef.current = true
					}),

					onPointerMove: newReadWriteHandler(() => {
						// Must be focused and pointer must be down:
						if (!state.focused || !pointerDownRef.current) {
							pointerDownRef.current = false
							return
						}
						const [pos1, pos2] = computePosRange(state, ref.current)
						dispatch.select(pos1, pos2)
					}),

					onPointerUp: newReadWriteHandler(() => {
						pointerDownRef.current = false
					}),

					onKeyDown: newReadWriteHandler(e => {
						switch (detectKeyDownType(e)) {
						case keyDownTypeEnum.tab:
							const focusedTodoCheckbox = state.focused && state.collapsed && document.activeElement?.getAttribute("data-codex-checkbox")
							if (focusedTodoCheckbox) {
								// No-op
								return
							}
							e.preventDefault()
							dispatch.tab(e.shiftKey)
							return
						case keyDownTypeEnum.enter:
							e.preventDefault()
							dispatch.enter()
							return
						case keyDownTypeEnum.backspaceParagraph:
							e.preventDefault()
							dispatch.backspaceParagraph()
							return
						case keyDownTypeEnum.backspaceWord:
							e.preventDefault()
							dispatch.backspaceWord()
							return
						case keyDownTypeEnum.backspaceRune:
							e.preventDefault()
							dispatch.backspaceRune()
							return
						case keyDownTypeEnum.forwardBackspaceWord:
							dispatch.forwardBackspaceWord()
							e.preventDefault()
							return
						case keyDownTypeEnum.forwardBackspaceRune:
							e.preventDefault()
							dispatch.forwardBackspaceRune()
							return
						case keyDownTypeEnum.undo:
							e.preventDefault()
							dispatch.undo()
							return
						case keyDownTypeEnum.redo:
							e.preventDefault()
							dispatch.redo()
							return
						// NOTE (1): Character data must be synthetic when
						// focused and **not** collapsed
						// NOTE (2): Breaks "compositionstart"
						case keyDownTypeEnum.characterData:
							if (state.focused && !state.collapsed) {
								e.preventDefault()
								dispatch.write(e.key !== "Dead" ? e.key : "")

								// const nodes = computeNodes(ref.current, state.extPosRange)
								// const [pos1, pos2] = computePosRange(state, ref.current)
								// dispatch.input(nodes, [pos1, pos2])
								return
							}
							// No-op
							break
						default:
							// No-op
							break
						}
					}),

					// onCompositionUpdate: newReadWriteHandler(e => {
					// 	console.log("onCompositionUpdate")
					//
					// 	const nodes = computeNodes(ref.current, state.extPosRange)
					// 	console.log({ data: nodes.map(each => each.data).join("\n") })
					// 	// const [pos1, pos2] = computePosRange(state, ref.current)
					// 	// dispatch.input(nodes, [pos1, pos2])
					// }),

					onCompositionEnd: newReadWriteHandler(e => {
						console.log("onCompositionEnd")

						// https://github.com/w3c/uievents/issues/202#issue-316461024
						dedupedCompositionEnd.current = true
						const nodes = computeNodes(ref.current, state.extPosRange)
						const [pos1, pos2] = computePosRange(state, ref.current)
						dispatch.input(nodes, [pos1, pos2])
					}),

					onInput: newReadWriteHandler(e => {
						// Force rerender when empty (takes precedence):
						if (!ref.current.childNodes.length) {
							dispatch.render()
							return
						}
						// Dedupe "compositionend":
						//
						// https://github.com/w3c/uievents/issues/202#issue-316461024
						if (dedupedCompositionEnd.current || e.nativeEvent.isComposing) {
							dedupedCompositionEnd.current = false
							return
						}
						const nodes = computeNodes(ref.current, state.extPosRange)
						const [pos1, pos2] = computePosRange(state, ref.current)
						dispatch.input(nodes, [pos1, pos2])
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

					contentEditable: !state.readOnly,
					suppressContentEditableWarning: !state.readOnly,
				},
			)}

			<pre className="text-sm" style={{ tabSize: 2, MozTabSize: 2 }}>
				{JSON.stringify(state.nodes, null, "\t")}
			</pre>

		</div>
	)
}

export default Editor
