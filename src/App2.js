// import Icon from "Icon"
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

const FixedEditorSettings = ({ saveStatus, state, dispatch }) => (
	// NOTE: Use flex flex-col because of the sidebar
	<div className="px-3 py-2 fixed inset-0 flex flex-col z-40 pointer-events-none">

		{/* Settings */}
		<div className="flex-shrink-0 flex flex-row justify-between w-full">

			{/* LHS */}
			<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
				<div className="m-1 flex flex-row items-center transition duration-300" style={{ opacity: !saveStatus || saveStatus === 3 ? "0" : "1" }}>
					<p className="font-medium text-xs text-gray-600">
						Saving
					</p>
					<svg
						// NOTE: ml-1 is preferable to ml-2
						className="ml-1 flex-shrink-0 w-4 h-4 text-green-500 transition duration-300"
						style={{ opacity: saveStatus !== 2 ? "0" : "1" }}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						{/* <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> */}
						<path d="M5 13l4 4L19 7"></path>
					</svg>
				</div>

			</div>

			{/* RHS */}
			<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
				<Button
					className="m-1 font-medium text-xs underline"
					onClick={dispatch.toggleReadOnly}
				>
					Preview ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "Control" : "⌘"}-P)
				</Button>
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

	const [saveStatus, setSaveStatus] = React.useState(0)
	const [hoveredContents, setHoveredContents] = React.useState(false)

	// Saves to localStorage (debounced).
	const mounted = React.useRef()
	React.useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		setSaveStatus(1)
		const ids = []
		ids.push(setTimeout(() => {
			const json = JSON.stringify({ data: editor.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
			ids.push(setTimeout(() => {
				setSaveStatus(2)
				ids.push(setTimeout(() => {
					setSaveStatus(3)
				}, 1e3))
			}, 1e3))
		}, 100))
		return () => {
			ids.slice().reverse().map(each => clearTimeout(each))
		}
	}, [editor.data])

	const [title, setTitle] = React.useState("")

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
		// NOTE: Use items-start for sticky
		<div className="px-6 py-32 flex flex-row justify-center items-start">

			{/* Fixed settings */}
			<FixedEditorSettings
				saveStatus={saveStatus}
				state={editorSettings}
				dispatch={editorSettingsDispatch}
			/>

			{/* <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="w-8 h-8"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> */}
			{/* <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="w-8 h-8"><path d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg> */}

			{/* LHS */}
			<div className="pb-12 sticky hidden lg:block w-48 overflow-x-hidden transition duration-300" style={{ top: 128, opacity: !contents.length ? "0" : "1" }}>
				{/* NOTE: Use w-full because of <Button> */}
				<Button className="py-1 flex flex-row items-center w-full text-gray-500 hover:text-blue-500 truncate transition duration-200" onPointerEnter={() => setHoveredContents(true)} onPointerLeave={() => setHoveredContents(false)}>
					<svg
						className="mr-2 flex-shrink-0 w-4 h-4"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<Transition
							// NOTE: Use duration-200 instead of duration-300
							show={!hoveredContents}
							enter="transition ease-out duration-200"
							enterFrom="transform opacity-0 -translate-x-64"
							enterTo="transform opacity-100 translate-x-0"
							leave="transition ease-in duration-200"
							leaveFrom="transform opacity-100 translate-x-0"
							leaveTo="transform opacity-0 -translate-x-64"
						>
							<path d="M4 6h16M4 12h16M4 18h7"></path>
						</Transition>
						<Transition
							// NOTE: Use duration-200 instead of duration-300
							show={hoveredContents}
							enter="transition ease-out duration-200"
							enterFrom="transform opacity-0 translate-x-64"
							enterTo="transform opacity-100 translate-x-0"
							leave="transition ease-in duration-200"
							leaveFrom="transform opacity-100 translate-x-0"
							leaveTo="transform opacity-0 translate-x-64"
						>
							{/* <path d="M7 16l-4-4m0 0l4-4m-4 4h18"></path> */}
							<path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
						</Transition>
					</svg>
					<p className="font-semibold text-xs tracking-wide uppercase truncate">
						{!hoveredContents ? (
							title.trim() || "Untitled"
						) : (
							"Hide sidebar (⇧-1)"
						)}
					</p>
				</Button>
				<div className="h-2" />
				<ul>
					{contents.map(({ id, hash, secondary, children }) => (
						<li key={hash} onClick={e => newScrollHandler(e, id, hash)}>
							{id !== "" && (
								<a href={`#${hash}`}>
									<h1 className="py-1 font-medium text-sm truncate text-gray-600 hover:text-blue-500 transition duration-300">
										{children || "Untitled"}
									</h1>
								</a>
							)}
							<ul>
								{secondary.map(({ id, hash, children }) => (
									<li key={hash} onClick={e => newScrollHandler(e, id, hash)}>
										<a href={`#${hash}`}>
											<h2 className="pl-4 py-1 font-medium text-sm truncate text-gray-600 hover:text-blue-500 transition duration-300">
												{children || "Untitled"}
											</h2>
										</a>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</div>

			{/* Spacer */}
			<div className="flex-shrink-0 hidden lg:block w-16"></div>

			{/* RHS */}
			<div className="xl:flex-shrink-0 w-full max-w-3xl">

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
				<div className="px-3 py-2 fixed inset-x-0 bottom-0 flex flex-row justify-between z-30 pointer-events-none">
					<p className="font-medium text-xs transition duration-300" style={{ fontFeatureSettings: "'tnum'", opacity: editor.readOnly || !editor.focused ? "0" : "1" }}>
						{statusLHS}
					</p>
					<p className="font-medium text-xs transition duration-300" style={{ fontFeatureSettings: "'tnum'", opacity: editor.readOnly || !editor.focused ? "0" : "1" }}>
						{statusRHS}
					</p>
				</div>

			</div>

			{/* Spacer */}
			<div className="hidden xl:block w-64"></div>

		</div>
	)
}

export default App
