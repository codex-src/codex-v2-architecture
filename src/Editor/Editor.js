import computePosRange from "./computePosRange"
import computeScrollingElementAndOffset from "./computeScrollingElementAndOffset"
import EditorContext from "./EditorContext"
import keyCodes from "./keyCodes"
import queryRoots from "./queryRoots"
import React from "react"
import ReactDOM from "react-dom"
import readRoots from "./readRoots"
import syncDOM from "./syncDOM"
import syncDOMPos from "./syncDOMPos"
import typeEnumArray from "./Elements/typeEnumArray"
import { ascendNode } from "./ascendNodes"
import { isListItemElement } from "./listElements"

import {
	detectRedo,
	detectUndo,
	isMetaOrCtrlKey,
} from "./detect"

import {
	AnyListRe,
	TaskListRe,
	UnorderedListRe,
} from "./parser/spec"

import "./Editor.css"
import "./tailwind-colors.css"
import "./tailwind-overrides.css"

// TODO: Add React.memo?
const ReactEditor = ({ state, dispatch }) => {
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

	// // Defer function (purge the cache).
	// React.useEffect(() => {
	// 	return () => {
	// 		dispatch.defer()
	// 	}
	// }, [])

	// Registers props.
	const mountedProps = React.useRef()
	React.useLayoutEffect(() => {
		if (!mountedProps.current) {
			mountedProps.current = true
			dispatch.registerProps({
				readOnly,
				focused: autoFocus,
			})
			return
		}
		dispatch.registerProps({ readOnly })
	}, [readOnly, autoFocus, dispatch])

	// Renders to the DOM.
	const mountedDOM = React.useRef()
	React.useLayoutEffect(
		React.useCallback(() => {

			let t = Date.now()

			ReactDOM.render(<ReactEditor state={state} dispatch={dispatch} />, state.reactDOM, () => {

				console.log(`ReactDOM.render=${Date.now() - t}`)
				t = Date.now()

				// Sync DOM:
				/* const mutations = */ syncDOM(state.reactDOM, ref.current, clonedElement => {
					const checkboxes = clonedElement.querySelectorAll("[data-codex-checkbox]")
					for (const each of checkboxes) {
						const { id } = each
							.parentElement // <div class="absolute">
							.parentElement // <li id="<uuid>">
						each.onpointerdown = e => {
							e.preventDefault()
							document.activeElement.blur()
						}
						each.onclick = () => {
							dispatch.checkTodo(id)
						}
					}
				})

				console.log(`syncDOM=${Date.now() - t}`)
				t = Date.now()

				if (!mountedDOM.current || state.readOnly || !state.focused) {
					mountedDOM.current = true
					return
				}

				// if (mutations) {
				// 	const s = mutations === 1 ? "" : "s"
				// 	console.log(`synced dom: ${mutations} mutation${s}`)
				// }

				// Sync DOM cursors:
				try {
					/* const syncedPos = */ syncDOMPos(ref.current, [state.pos1, state.pos2])
					// if (syncedPos) {
					// 	console.log("synced pos")
					// }
				} catch (error) {
					console.error(error)
					return
				}

				console.log(`syncDOMPos=${Date.now() - t}`)

				setTimeout(() => {
					const computed = computeScrollingElementAndOffset(scrollTopOffset, scrollBottomOffset)
					if (!computed || !computed.offset) {
						// No-op
						return
					}
					const { scrollingElement, offset } = computed
					console.log(scrollingElement, offset)
					scrollingElement.scrollBy(0, offset)
				}, 0)

				// t = Date.now()
				//
				// // Force select for edge-cases such as forward-
				// // backspace (pos does not change but the DOM does):
				// const [pos1, pos2] = computePosRange(ref.current)
				// dispatch.select(pos1, pos2)
				//
				// console.log(`computePosRange=${Date.now() - t}`)
			})
		}, [state, dispatch]),
		[state.readOnly, state.elements],
	)

	// Rerenders on DOMContentLoaded for syntax highlighting.
	React.useEffect(() => {
		const handler = () => {
			dispatch.render()
		}
		document.addEventListener("DOMContentLoaded", handler)
		return () => {
			document.removeEventListener("DOMContentLoaded", handler)
		}
	}, [dispatch])

	// Stores the next undo (debounced 250ms).
	React.useEffect(
		React.useCallback(() => {
			if (state.readOnly) {
				// No-op
				return
			}
			const id = setTimeout(() => {
				dispatch.storeUndo()
			}, 250)
			return () => {
				clearTimeout(id)
			}
		}, [state, dispatch]),
		[state.readOnly, state.data],
	)

	// Exclusively returns a function for read-write mode.
	//
	// TODO: Move before useEffect use for storeUndo?
	const newReadWriteHandler = handler => {
		if (state.readOnly) {
			return undefined
		}
		return handler
	}

	return (
	// <div>

		React.createElement(
			"div",
			{
				ref,

				id,

				className: `codex-editor${
					!state.readOnly ? "" : " feature-read-only"
				}${
					!className ? "" : ` ${className}`
				} text-gray-800 subpixel-antialiased`,

				style: {
					...style, // Takes precedence
					MozTabSize: 4,
					tabSize: 4,
					fontFeatureSettings: "'tnum'",
					whiteSpace: "pre-wrap",
					outline: "none",
					// NOTE: overflowWrap: "break-word" does not work
					// as expected
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
					const [pos1, pos2] = computePosRange(ref.current)
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
					const [pos1, pos2] = computePosRange(ref.current)
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
						e.preventDefault()
						const selection = document.getSelection()
						const range = selection.getRangeAt(0)
						if (state.pos1.pos === state.pos2.pos && !isListItemElement(ascendNode(range.startContainer))) {
							dispatch.tab()
						} else if (!e.shiftKey) {
							dispatch.tabMany()
						} else {
							dispatch.detabMany()
						}
						// No-op
						return
					// Enter:
					} else if (e.keyCode === keyCodes.Enter) {
						e.preventDefault()

						// Returns whether the start cursor is focused
						// on a list item element e.g. <li>.
						const isFocusedListItemElement = () => {
							const selection = document.getSelection()
							if (!selection.rangeCount) {
								return false
							}
							const range = selection.getRangeAt(0)
							return isListItemElement(ascendNode(range.startContainer))
						}

						let autoSyntax = ""
						if (state.pos1.pos === state.pos2.pos && isFocusedListItemElement()) {
							const node = state.nodes[state.pos1.y]
							const [, tabs, syntax] = node.data.match(AnyListRe)
							if (tabs + syntax === node.data) {
								dispatch.backspaceParagraph()
								return
							}
							autoSyntax = tabs + syntax // E.g. unordered
							if (TaskListRe.test(autoSyntax)) {
								autoSyntax = `${tabs}- [ ] `
							} else if (UnorderedListRe.test(autoSyntax)) {
								autoSyntax = `${tabs}- `
							}
						}
						dispatch.enter(autoSyntax)
						return
					}
					// Backspace paragraph:
					if (isMetaOrCtrlKey(e) && e.keyCode === keyCodes.Backspace) {
						e.preventDefault()
						dispatch.backspaceParagraph()
						return
						// Backspace word:
					} else if (e.altKey && e.keyCode === keyCodes.Backspace) { // FIXME: e.altKey for non-macOS?
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
						dispatch.undo()
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
					const [pos1, pos2] = computePosRange(ref.current)
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
					// Intercept data-codex-node or data-codex-root
					// events:
					//
					// NOTE: Do not trust Chrome (as of 81) for
					// e.nativeEvent.inputType:
					//
					// backspace-word -> deleteWordBackward
					// backspace-rune -> deleteWordBackward ??
					//
					// https://w3.org/TR/input-events-2/#interface-InputEvent-Attributes
					switch (navigator.vendor !== "Google Inc." && e.nativeEvent.inputType) {
					// Backspace (any):
					case "deleteHardLineBackward":
					case "deleteSoftLineBackward":
						dispatch.backspaceParagraph()
						return
					case "deleteWordBackward":
						dispatch.backspaceWord()
						return
					case "deleteContentBackward":
						dispatch.backspaceRune()
						return
					case "deleteWordForward":
						dispatch.forwardBackspaceWord()
						return
					// Forward-backspace (any):
					case "deleteContentForward":
						dispatch.forwardBackspaceRune()
						return
					// Enter:
					case "insertLineBreak":
					case "insertParagraph":
						dispatch.enter()
						return
					// Undo:
					case "historyUndo":
						dispatch.undo()
						return
					// Redo:
					case "historyRedo":
						dispatch.redo()
						return
					default:
						// No-op
						break
					}
					const { roots: [root1, root2], atEnd } = queryRoots(ref.current, state.extPosRange)
					const nodes = readRoots(ref.current, [root1, root2])
					const [pos1, pos2] = computePosRange(ref.current)
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

	// <div className="py-6 whitespace-pre-wrap font-mono text-xs leading-snug" style={{ MozTabSize: 2, tabSize: 2 }}>
	// 	{JSON.stringify(
	// 		{
	// 			...state,
	// 			history:   undefined,
	// 			elements:  undefined,
	// 			reactDOM:  undefined,
	// 		},
	// 		// state.history.stack.map(each => ({
	// 		// 	...each,
	// 		// 	data: undefined,
	// 		// 	nodes: each.nodes.map(each => ({
	// 		// 		...each,
	// 		// 		data: !each.data ? "" : `${each.data.slice(0, 60 - 1)}…`,
	// 		// 	})),
	// 		// 	pos1: undefined,
	// 		// 	pos2: undefined,
	// 		// })),
	// 		null,
	// 		"\t",
	// 	)}
	// </div>

	// </div>
	)
}

export default Editor
