import computePosRange from "./computePosRange"
import computeScrollingElementAndOffset from "./computeScrollingElementAndOffset"
import detectKeyDownType from "./detectKeyDownType"
import EditorContext from "./EditorContext"
import keyDownTypeEnum from "./keyDownTypeEnum"
import queryRoots from "./queryRoots"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
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

	// Registers props.
	React.useEffect(() => {
		dispatch.registerProps({ readOnly, autoFocus })
	}, [readOnly, autoFocus, dispatch])

	// Renders to the DOM.
	React.useLayoutEffect(
		React.useCallback(() => {

			let t = Date.now()

			// TODO: Eagerly dropping the selection may tamper
			// break soft keyboards (on iOS this is a non-problem)

			// Eagerly drop selection for performance reasons:
			//
			// https://bugs.chromium.org/p/chromium/issues/detail?id=138439#c10
			const selection = document.getSelection()
			if (selection.rangeCount) {
				selection.removeAllRanges()
			}
			ReactDOM.render(<Elements state={state} dispatch={dispatch} />, ref.current, () => {
				console.log(`ReactDOM.render=${Date.now() - t}`)
				if (state.readOnly || !state.focused) {
					// No-op
					return
				}
				t = Date.now()
				// Sync DOM cursors:
				try {
					syncPos(state, ref.current, [state.pos1, state.pos2])
				} catch (error) {
					console.error(error)
					return
				}
				console.log(`syncPos=${Date.now() - t}`)
				// Defer to useEffect:
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
	//
	// TODO: Extract to useHistory?
	React.useEffect(
		React.useCallback(() => {
			if (state.readOnly) {
				// No-op
				return
			}
			const id = setTimeout(() => {
				const { data, nodes, pos1, pos2 } = state
				const currentState = { data, nodes, pos1, pos2 }
				dispatch.pushUndo(currentState)
			}, 250)
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
		React.createElement(
			"div",
			{
				ref,

				id,

				className: trimWhiteSpace(`em-context codex-editor ${!state.readOnly ? "" : "feature-read-only"} ${className}`),

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
					if (!selection.rangeCount) {
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
					// Editor must be focused and pointer must be down:
					if (!state.focused || !pointerDownRef.current) {
						pointerDownRef.current = false // Reset to be safe
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
						// const focusedCheckbox = document.activeElement.getAttribute("data-codex-checkbox")
						// if (focusedCheckbox) {
						// 	// No-op
						// 	return
						// }

						// if (state.focused && state.collapsed && )
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
					default:
						// No-op
						break
					}

					// TODO: Cut, copy, paste need to passthrough
					if (state.pos1.pos !== state.pos2.pos && ((!e.ctrlKey && !e.altKey && !e.metaKey && [...e.key].length === 1) || e.key === "Dead")) {
						e.preventDefault()
						dispatch.write(e.key !== "Dead" ? e.key : "")
						return
					}
				}),

				onCompositionEnd: newReadWriteHandler(e => {
					console.log("onCompositionEnd")

					// https://github.com/w3c/uievents/issues/202#issue-316461024
					dedupedCompositionEnd.current = true
					const { roots: [root1, root2], atEnd } = queryRoots(ref.current, state.extPosRange)
					const nodes = readRoots(ref.current, [root1, root2])
					const [pos1, pos2] = computePosRange(state, ref.current)
					dispatch.input(nodes, atEnd, [pos1, pos2])

					console.log(nodes)
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
					// if (e.nativeEvent.inputType == "insertCompositionText") {
					if (e.nativeEvent.isComposing) { // FIXME
						// dedupedCompositionEnd.current = false
						return
					}
					const { roots: [root1, root2], atEnd } = queryRoots(ref.current, state.extPosRange)
					const nodes = readRoots(ref.current, [root1, root2])
					const [pos1, pos2] = computePosRange(state, ref.current)
					dispatch.input(nodes, atEnd, [pos1, pos2])
				}),

				onCut: newReadWriteHandler(e => {
					e.preventDefault()
					if (state.collapsed) {
						// No-op
						return
					}
					const data = state.data.slice(state.pos1.pos, state.pos2.pos)
					e.clipboardData.setData("text/plain", data)
					dispatch.cut()
				}),

				onCopy: newReadWriteHandler(e => {
					e.preventDefault()
					if (state.collapsed) {
						// No-op
						return
					}
					const data = state.data.slice(state.pos1.pos, state.pos2.pos)
					e.clipboardData.setData("text/plain", data)
					dispatch.copy()
				}),

				onPaste: newReadWriteHandler(e => {
					e.preventDefault()
					const data = e.clipboardData.getData("text/plain")
					if (!data) {
						// No-op
						return
					}
					dispatch.paste(data)
				}),

				contentEditable: !state.readOnly,
				suppressContentEditableWarning: !state.readOnly,
			},
		)
	)
}

export default Editor
