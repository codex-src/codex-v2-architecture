import computePosRange from "./computePosRange"
import computeScrollingElementAndOffset from "./computeScrollingElementAndOffset"
import decorator from "./decorator"
import EditorContext from "./EditorContext"
import keyCodes from "./keyCodes"
import queryRoots from "./queryRoots"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
import syncPos from "./syncPos"
import typeEnumArray from "./Elements/typeEnumArray"
import useDOMContentLoaded from "lib/useDOMContentLoaded"
import { deeplySyncNodes } from "./syncNodes"

import {
	detectRedo,
	detectUndo,
	isMetaOrCtrlKey,
} from "./detect"

import "./Editor.css"
import "./tailwind-colors.css"
import "./tailwind-overrides.css"

const Elements = ({ state, dispatch }) => {
	const { Provider } = EditorContext
	return (
		<Provider value={[state, dispatch]}>
			{state.elements.map(({ type: T, ...each }) => (
				React.createElement(typeEnumArray[T], {
					key: each.id,
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

			ReactDOM.render(<Elements state={state} dispatch={dispatch} />, state.reactDOM, () => {

				console.log(`ReactDOM.render=${Date.now() - t}`)

				const syncedNodes = deeplySyncNodes(state.reactDOM, ref.current)
				const decorate = decorator(state, dispatch)
				decorate(syncedNodes)
				if (state.readOnly || !state.focused) {
					// No-op
					return
				}

				t = Date.now()

				// Sync DOM cursors:
				try {
					syncPos(ref.current, [state.pos1, state.pos2])
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

				// t = Date.now()
				//
				// // Force select for edge-cases such as forward-
				// // backspace (pos does not change but the DOM does):
				// const [pos1, pos2] = computePosRange(state.nodes)
				// dispatch.select(pos1, pos2)
				//
				// console.log(`computePosRange=${Date.now() - t}`)

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

				className: `codex-editor${
					!state.readOnly ? "" : " feature-read-only"
				}${
					!className ? "" : ` ${className}`
				} subpixel-antialiased`,

				style: {
					...style, // Takes precedence

					MozTabSize: 4,
					tabSize: 4,
					fontFeatureSettings: "'tnum'",

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
					// Guard out of bounds range:
					const range = selection.getRangeAt(0)
					if (range.startContainer === ref.current || range.endContainer === ref.current) {
						// Iterate to the deepest start node:
						let node1 = ref.current.childNodes[0]
						while (node1.childNodes.length) {
							node1 = node1.childNodes[0]
						}

						// // Iterate to the deepest end node:
						// let node2 = ref.current.childNodes[ref.current.childNodes.length - 1]
						// while (node2.childNodes.length) {
						// 	node2 = node2.childNodes[node2.childNodes.length - 1]
						// }

						// Correct range:
						range.setStart(node1, 0)
						// range.setEnd(node2, (node2.nodeValue || "").length)
						range.collapse()
						selection.removeAllRanges()
						selection.addRange(range)
					}
					const [pos1, pos2] = computePosRange(state.nodes)
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
					const [pos1, pos2] = computePosRange(state.nodes)
					dispatch.select(pos1, pos2)
				}),

				onPointerUp: newReadWriteHandler(() => {
					pointerDownRef.current = false
				}),

				onKeyDown: newReadWriteHandler(e => {
					// NOTE: Safari registers select-all, cut, copy,
					// and paste as key press events
					if (navigator.vendor === "Apple Computer, Inc." && (
						e.keyCode === keyCodes.A ||
						e.keyCode === keyCodes.X ||
						e.keyCode === keyCodes.C ||
						e.keyCode === keyCodes.V
					)) {
						// No-op
						return
					}
					// Tab:
					if (!e.ctrlKey && e.keyCode === keyCodes.Tab) {
						const focusedCheckbox = document.activeElement.getAttribute("data-codex-checkbox")
						if (focusedCheckbox) {
							// No-op
							return
						}
						e.preventDefault()
						dispatch.tab(e.shiftKey)
						return
					// Enter:
					} else if (e.keyCode === keyCodes.Enter) {
						e.preventDefault()
						dispatch.enter()
						return
					}
					// Backspace paragraph:
					if (isMetaOrCtrlKey(e) && e.keyCode === keyCodes.Backspace) {
						e.preventDefault()
						dispatch.backspaceParagraph()
						return
					// Backspace word:
					//
					// FIXME: e.altKey for non-macOS?
					} else if (e.altKey && e.keyCode === keyCodes.Backspace) {
						e.preventDefault()
						dispatch.backspaceWord()
						return
					// Backspace rune:
					} else if (e.keyCode === keyCodes.Backspace) {
						e.preventDefault()
						dispatch.backspaceRune()
						return
					// Forward-backspace word:
					} else if (navigator.userAgent.indexOf("Mac OS X") !== -1 && e.altKey && e.keyCode === keyCodes.Delete) {
						e.preventDefault()
						dispatch.forwardBackspaceWord()
						return
					// Forward-backspace rune:
					} else if (e.keyCode === keyCodes.Delete || (navigator.userAgent.indexOf("Mac OS X") !== -1 && e.ctrlKey && e.keyCode === keyCodes.D)) {
						e.preventDefault()
						dispatch.forwardBackspaceRune()
						return
					}
					// Undo:
					if (detectUndo(e)) {
						e.preventDefault()
						const { data, nodes, pos1, pos2 } = state
						const currentState = { data, nodes, pos1, pos2 }
						dispatch.undo(currentState)
						return
					// Redo:
					} else if (detectRedo(e)) {
						e.preventDefault()
						dispatch.redo()
						return
					}
				}),

				onCompositionEnd: newReadWriteHandler(e => {
					// https://github.com/w3c/uievents/issues/202#issue-316461024
					dedupedCompositionEnd.current = true
					const { roots: [root1, root2], atEnd } = queryRoots(ref.current, state.extPosRange)
					const nodes = readRoots(ref.current, [root1, root2])
					const [pos1, pos2] = computePosRange(state.nodes)
					dispatch.input(nodes, atEnd, [pos1, pos2])
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
					// // Intercept data-codex-node or data-codex-root
					// // events:
					// //
					// // NOTE: Do not trust Chrome (as of 81) for
					// // e.nativeEvent.inputType:
					// //
					// // backspace-word -> deleteWordBackward
					// // backspace-rune -> deleteWordBackward ??
					// //
					// // https://w3.org/TR/input-events-2/#interface-InputEvent-Attributes
					// //
					// // TODO: Add "insertCompositionText" and
					// // "deleteCompositionText"?
					// switch (navigator.vendor !== "Google Inc." && e.nativeEvent.inputType) {
					// // Backspace (any):
					// case "deleteHardLineBackward":
					// case "deleteSoftLineBackward":
					// 	dispatch.backspaceParagraph()
					// 	return
					// case "deleteWordBackward":
					// 	dispatch.backspaceWord()
					// 	return
					// case "deleteContentBackward":
					// 	dispatch.backspaceRune()
					// 	return
					// case "deleteWordForward":
					// 	dispatch.forwardBackspaceWord()
					// 	return
					// // Forward-backspace (any):
					// case "deleteContentForward":
					// 	dispatch.forwardBackspaceRune()
					// 	return
					// // Enter:
					// case "insertLineBreak":
					// case "insertParagraph":
					// 	dispatch.enter()
					// 	return
					// // Undo:
					// case "historyUndo":
					// 	dispatch.undo()
					// 	return
					// // Redo:
					// case "historyRedo":
					// 	dispatch.redo()
					// 	return
					// default:
					// 	// No-op
					// 	break
					// }
					const { roots: [root1, root2], atEnd } = queryRoots(ref.current, state.extPosRange)
					const nodes = readRoots(ref.current, [root1, root2])
					const [pos1, pos2] = computePosRange(state.nodes)
					dispatch.input(nodes, atEnd, [pos1, pos2])
				}),

				onCut: newReadWriteHandler(e => {
					e.preventDefault()
					if (state.pos1.pos === state.pos2.pos) {
						// No-op
						return
					}
					const data = state.data.slice(state.pos1.pos, state.pos2.pos)
					e.clipboardData.setData("text/plain", data)
					dispatch.cut()
				}),

				onCopy: newReadWriteHandler(e => {
					e.preventDefault()
					if (state.pos1.pos === state.pos2.pos) {
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

// <div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ MozTabSize: 2, tabSize: 2 }}>
// 	{JSON.stringify(state.history, null, "\t")}
// </div>

export default Editor
