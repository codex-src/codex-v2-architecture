import Button from "Button"
import DocumentTitle from "DocumentTitle"
import Editor from "Editor2/Editor"
import Highlighted from "Highlighted"
import raw from "raw.macro"
import React from "react"
import renderModesEnum from "EditorSettings/renderModesEnum"
import Transition from "Transition"
import typeEnum from "Editor2/typeEnum"
import useEditor from "Editor2/useEditor"
import useEditorSettings from "EditorSettings/useEditorSettings"
import { isMetaOrCtrlKey } from "Editor2/detect"

import {
	toInnerText,
	toText,
} from "Editor2/cmap"

import "./App.css"

const ReadmeEditor = ({ readOnly }) => {
	const [state, dispatch] = useEditor(raw("./Readme.md"))
	return <Editor style={{ fontSize: 15 }} state={state} dispatch={dispatch} readOnly={readOnly} />
}

const FixedEditorSettings = ({ state, dispatch }) => (
	// NOTE: Usese flex flex-col for the sidebar
	<div className="p-3 pb-4 fixed inset-0 flex flex-col z-40 pointer-events-none">

		{/* Buttons */}
		<div className="flex-shrink-0 flex flex-row justify-end w-full">
	 		<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
				<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
					<Button
						className="m-1 font-medium text-xs underline"
						onClick={dispatch.toggleReadOnly}
					>
						Preview ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "ctrl" : "⌘"}-P)
					</Button>
				</div>
	 			<Button
	 				className="m-1 font-medium text-xs underline"
	 				onClick={dispatch.showReadme}
	 			>
	 				Readme (esc)
	 			</Button>
	 			<Button
	 				className="m-1 font-medium text-xs underline"
	 				onClick={dispatch.showHTML}
	 			>
	 				HTML
	 			</Button>
	 			<Button
	 				className="m-1 font-medium text-xs underline"
	 				onClick={dispatch.showJSON}
	 			>
	 				JSON
	 			</Button>
			</div>
		</div>

		{/* Sidebar */}
		<div className="flex-shrink-0 h-2" />
		<Transition
			show={state.showSidebar}
			enter="transition ease-out duration-300"
			enterFrom="transform opacity-0 translate-x-64"
			enterTo="transform opacity-100 translate-x-0"
			leave="transition ease-in duration-300"
			leaveFrom="transform opacity-100 translate-x-0"
			leaveTo="transform opacity-0 translate-x-64"
		>
			<div className="p-6 self-end w-full max-w-lg max-h-full bg-white rounded-lg shadow-hero-lg overflow-y-scroll scrolling-touch pointer-events-auto">
				{state.renderMode === renderModesEnum.Readme ? (
					<ReadmeEditor readOnly={state.readOnly} />
				) : (
					/* NOTE: inline-block is needed for overflow-x-scroll */
					<span className="inline-block">
						<pre className="whitespace-pre font-mono text-xs leading-snug subpixel-antialiased" style={{ MozTabSize: 2, tabSize: 2 }}>
							<Highlighted extension={state.extension}>
								{state[state.renderMode]}
							</Highlighted>
						</pre>
					</span>
				)}
			</div>
		</Transition>

	</div>
)

const rant = `I seriously agree with this article. I find TypeScript to be a kind of exchange of productivity for correctness, which, to be honest, in the real-world is less practical. Think about it this way — would you rather have end-to-end tests that test your production-ready application or TypeScript complain in development? Think carefully, because the answer is not obvious. **TypeScript takes time to get right. A lot of time. This is time you could be testing your application _in the wild_, rather than testing its correctness in development.** Yes, there _is_ some crossover here, but it’s not 100%. When you use TypeScript, you are **betting on TypeScript** helping you more than hurting you.

What I’m trying to say is that TypeScript is a _very steep bet_. But something about this is unsettling — Go is not dynamic, and I find writing Go to be easier than TypeScript, so what gives? I actually think the crux of the problem is that TypeScript is trying to fix JavaScript. _But what if JavaScript doesn’t need fixing?_ Then TypeScript actually doesn’t pay for itself. I say all of this as a cautionary tale for developers. I’ve been turned on and off multiple times by TypeScript. Ultimately, I think that some languages introduce so much complexity up front that if you try to wrangle them in later, you’re optimizing for the wrong problem.

I’m sure some of you will say that TypeScript makes you more productive, and if you are one of these people, that’s great. But I found I ran into similar problems as Lucas — TypeScript’s documentation and error messages are far from friendly, and TypeScript as a system starts to break down the more complexity you introduce into your app, e.g. recursive types, etc. I’m having bugs where my IDE and app don’t even agree. And I simply don’t have the time to find the root cause of every problem I run into, because most of these problems are concerned with correctness.`

const LOCALSTORAGE_KEY = "codex-app-v2.3"

const data = (() => {
	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
	if (!cache) {
		return rant // raw("./App.md")
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return rant // raw("./App.md")
	}
	return json.data
})()

// NOTE: h1 and h2 elements are considered primary headers;
// h3 through h6 are considered secondary headers
function computeContents(reactVDOM) {
	const contents = []
	const headers = reactVDOM.filter(each => each.type === typeEnum.Header)
	for (const { tag, id, hash, children } of headers.slice(1)) {
		switch (tag) {
		case "h1":
		case "h2":
			contents.push({
				id,
				hash,
				secondary: [],
				children: toInnerText(children),
			})
			break
		case "h3":
		case "h4":
		case "h5":
		case "h6":
			if (!contents.length || !contents[contents.length - 1].secondary) {
				contents.push({
					id: "",
					hash: "",
					secondary: [],
					children: "",
				})
			}
			contents[contents.length - 1].secondary.push({
				id,
				hash,
				children: toInnerText(children),
			})
			break
		default:
			// No-op
			break
		}
	}
	return contents
}

// Computes the LHS status string.
function computeStatusLHS(editor) {
	const lhs = ((chars, lines) => {
		if (editor.pos1.pos === editor.pos2.pos) {
			// if (!editor.focused) {
			// 	return "" // "No selection"
			// }
			return `Line ${format(editor.pos1.y + 1)}, column ${format(editor.pos1.x + 1)}`
		} else {
			// if (!editor.focused) {
			// 	return "" // "No selection"
			// }
			return `Selected ${lines < 2 ? "" : `${format(lines)} lines, `}${format(chars)} character${chars === 1 ? "" : "s"}`
		}
	})(editor.pos2.pos - editor.pos1.pos, editor.pos2.y - editor.pos1.y + 1)
	return lhs
}

// Computes the RHS status string.
function computeStatusRHS(editor) {
	const str = toText(editor.reactVDOM)
	const metadata = {
		words: str.split(/\s+/).filter(Boolean).length,
		minutes: Math.round([...str].length / 4.7 / 300), // Characters per word / words per minute
	}
	const rhs = ((words, minutes) => {
		return `${format(words)} word${words === 1 ? "" : "s"}${!minutes ? "" : `, est. ${format(minutes)} minute read`}`
	})(metadata.words, metadata.minutes)
	return rhs
}

// Returns a new scroll handler; scrolls to an ID.
//
// ---------------
// |    128px    |
// ---------------
// TITLE … # Title
//
function newScrollHandler(e, id, hash) {
	// NOTE: Use e.preventDefault and e.stopPropagation
	// because handlers are nested
	e.preventDefault()
	e.stopPropagation()
	const element = document.getElementById(id)
	if (!element) {
		// No-op
		return
	}
	window.location.hash = hash
	window.scrollTo(0, element.offsetTop - 128)
}

// Shorthand.
function format(n) {
	return n.toLocaleString("en")
}

const App = () => {
	// TODO: Use props.children instead of useEditor?
	const [editor, editorDispatch] = useEditor(data)
	const [editorSettings, editorSettingsDispatch] = useEditorSettings(renderModesEnum.Readme)

	const [title, setTitle] = React.useState(() => "")

	React.useEffect(() => {
		const id = setTimeout(() => {
			const title = toText(editor.reactVDOM.slice(0, 1)).split("\n", 1)[0]
			setTitle(title)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editor])

	const [contents, setContents] = React.useState(() => computeContents(editor.reactVDOM))

	React.useEffect(() => {
		const id = setTimeout(() => {
			const contents = computeContents(editor.reactVDOM)
			setContents(contents)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editor])

	const [statusLHS, setStatusLHS] = React.useState("")

	React.useEffect(() => {
		const statusLHS = computeStatusLHS(editor)
		setStatusLHS(statusLHS)
	}, [editor])

	const [statusRHS, setStatusRHS] = React.useState("")

	React.useEffect(() => {
		const id = setTimeout(() => {
			const statusRHS = computeStatusRHS(editor)
			setStatusRHS(statusRHS)
		// NOTE: Do not use 100 -- breaks fade effect
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editor])

	// Sets renderers (debounced).
	React.useEffect(() => {
		const id = setTimeout(() => {
			if (!editorSettings.showSidebar) {
				// No-op
				return
			}
			editorSettingsDispatch.update(editor)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [
		// Logically sorted:
		editor,
		editorSettings.showSidebar,
		editorSettingsDispatch,
	])

	// Saves to localStorage (debounced).
	React.useEffect(() => {
		const id = setTimeout(() => {
			const json = JSON.stringify({ data: editor.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
		}, 100)
		return () => {
			clearTimeout(id)
		}
	}, [editor.data])

	// Manages read-only mode.
	React.useEffect(() => {
		const handler = e => {
			const ok = (
				!e.shiftKey &&
				!e.altKey &&
				isMetaOrCtrlKey(e) &&
				e.keyCode === 80 // 80: P
			)
			if (!ok) {
				// No-op
				return
			}
			e.preventDefault()
			editorDispatch.toggleReadOnly()
			editorSettingsDispatch.toggleReadOnly()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [
		// Logically sorted:
		editorDispatch,
		editorSettingsDispatch,
	])

	// Manages sidebar (debounced -- match useEffect).
	React.useEffect(() => {
		const handler = e => {
			if (e.keyCode !== 27) { // 27: Escape
				// No-op
				return
			}
			e.preventDefault()
			const id = setTimeout(() => {
				editorSettingsDispatch.toggleSidebar()
			}, 16.67)
			return () => {
				clearTimeout(id)
			}
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [editorSettingsDispatch])

	return (
		<div className="px-6 py-32">

			{/* Settings */}
			<FixedEditorSettings
				state={editorSettings}
				dispatch={editorSettingsDispatch}
			/>

			{/* Grid */}
			<div className="grid-contents-editor">

				{/* LHS */}
				<div className="pb-12 grid-contents overflow-x-hidden transition duration-300" style={{ opacity: !contents.length ? "0" : "1" }}>
					<div className="py-1 flex flex-row items-center">
						<svg
							className="mr-2 flex-shrink-0 w-4 h-4 text-gray-500 transform scale-95 origin-left"
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M4 6h16M4 12h16M4 18h7"></path>
						</svg>
						<p className="font-semibold text-xs tracking-wide truncate text-gray-500">
							{(title.trim() || "Untitled").toUpperCase()}
						</p>
					</div>
					<div className="h-2" />
					<ul>
						{contents.map(({ id, hash, secondary, children }) => (
							<li key={hash} onClick={e => newScrollHandler(e, id, hash)}>
								{id !== "" && (
									<a href={`#${hash}`}>
										<h1 className="py-1 font-medium text-sm truncate text-gray-600 hover:text-blue-500 transition duration-300">
											{children || (
												 "Untitled"
											)}
										</h1>
									</a>
								)}
								<ul>
									{secondary.map(({ id, hash, children }) => (
										<li key={hash} onClick={e => newScrollHandler(e, id, hash)}>
											<a href={`#${hash}`}>
												<h2 className="pl-4 py-1 font-medium text-sm truncate text-gray-600 hover:text-blue-500 transition duration-300">
													{children || (
														"Untitled"
													)}
												</h2>
											</a>
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>

				{/* RHS */}
				<div className="grid-editor">

					{/* Editor */}
					<DocumentTitle title={title || "Untitled"}>
						{/* TODO: Add React.forwardRef */}
						<Editor
							className="grid-editor"
							// TODO: Use a ref to compute the height of
							// the last data-codex-node or data-codex-root
							style={{ paddingBottom: "calc(100vh - 128px - 25px)", fontSize: 17 }}
							state={editor}
							dispatch={editorDispatch}
							readOnly={editorSettings.readOnly}
						/>
					</DocumentTitle>

					{/* Status bars */}
					{!editor.readOnly && (
						<div className="px-3 py-2 fixed inset-x-0 bottom-0 flex flex-row justify-between z-30 pointer-events-none">
							<p className="font-medium text-xs transition duration-300" style={{ fontFeatureSettings: "'tnum'", opacity: !editor.focused ? "0" : "1" }}>
								{statusLHS}
							</p>
							<p className="font-medium text-xs transition duration-300" style={{ fontFeatureSettings: "'tnum'", opacity: !editor.focused ? "0" : "1" }}>
								{statusRHS}
							</p>
						</div>
					)}

				</div>

			</div>

		</div>
	)
}

export default App
