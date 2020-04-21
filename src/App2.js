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
import { toInnerText } from "Editor2/cmap"

import "./App.css"

const ReadmeEditor = ({ readOnly }) => {
	const [state, dispatch] = useEditor(raw("./Readme.md"))
	return <Editor style={{ fontSize: 15 }} state={state} dispatch={dispatch} readOnly={readOnly} />
}

const FixedEditorSettings = ({ state, dispatch }) => (
	// NOTE: Usese flex flex-col for the sidebar
	<div className="p-3 pb-4 fixed inset-0 flex flex-col z-40 pointer-events-none">

		{/* Buttons */}
		<div className="flex-shrink-0 flex flex-row justify-between w-full">

			{/* LHS */}
			<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.toggleReadOnly}
				>
					Preview mode: {!state.readOnly ? "off" : "on"} ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "ctrl" : "⌘"}-p)
				</Button>
				{/* <Button */}
				{/* 	className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75" */}
				{/* 	onClick={dispatch.toggleCSSDebugger} */}
				{/* > */}
				{/* 	Toggle CSS debugger: {`${state.debugCSS}`} */}
				{/* </Button> */}
			</div>

			{/* RHS */}
	 		<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
	 			<Button
	 				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
	 				onClick={dispatch.showReadme}
	 			>
	 				Readme (esc)
	 			</Button>
	 			<Button
	 				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
	 				onClick={dispatch.showJSON}
	 			>
	 				JSON
	 			</Button>
	 			<Button
	 				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
	 				onClick={dispatch.showHTML}
	 			>
	 				HTML
	 			</Button>
			</div>

		</div>

		{/* Sidebar */}
		<div className="flex-shrink-0 h-6" />
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

const keyCodeEsc = 27
const keyCodeP = 80

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

// Shorthand.
function commas(n) {
	return n.toLocaleString("en")
}

// TODO: <DocumentTitle> should be instant; use toText on a
// subset of editor.reactVDOM
const App = () => {
	// TODO: Use props.children instead of useEditor?
	const [editor, editorDispatch] = useEditor(data)
	const [editorSettings, editorSettingsDispatch] = useEditorSettings(renderModesEnum.Readme)

	// Debounces renderers by one frame.
	React.useEffect(() => {
		const id = setTimeout(() => {
			editorSettingsDispatch.shallowUpdate(editor)
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

	// Writes editor.data to localStorage (debounced 100ms).
	React.useEffect(() => {
		const id = setTimeout(() => {
			const json = JSON.stringify({ data: editor.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
		}, 100)
		return () => {
			clearTimeout(id)
		}
	}, [editor.data])

	// Binds read-only shortcut.
	React.useEffect(() => {
		const handler = e => {
			// TODO: Refactor?
			if (!(!e.shiftKey && !e.altKey && isMetaOrCtrlKey(e) && e.keyCode === keyCodeP)) {
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

	// Binds sidebar shortcut.
	React.useEffect(() => {
		const handler = e => {
			if (e.keyCode !== keyCodeEsc) {
				// No-op
				return
			}
			e.preventDefault()
			editorSettingsDispatch.toggleSidebar()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [editorSettingsDispatch])

	// // Parse a table of contents.
	// const parseToC = reactVDOM => {
	// 	const toc = []
	// 	const headers = reactVDOM.filter(each => each.type === typeEnum.Header)
	// 	for (const each of headers) {
	// 		if (each.tag === "h1") {
	// 			toc.push({ ...each, subheaders: [] })
	// 		} else if (toc.length) {
	// 			toc[toc.length - 1].subheaders.push(each)
	// 		}
	// 	}
	// 	return toc
	// }

	// Parse a table of contents.
	const parseToC = reactVDOM => {
		const toc = []
		const headers = reactVDOM.filter(each => each.type === typeEnum.Header)
		for (const each of headers) {
			switch (each.tag) {
			case "h1":
			case "h2":
				toc.push({ ...each, subheaders: [] })
				break
			case "h3":
			case "h4":
			case "h5":
			case "h6":
				let nth = toc.length - 1
				if (nth === -1) {
					nth = 0
				}
				toc[nth].subheaders.push(each)
				break
			default:
				// No-op
				break
			}
		}
		// console.log(toc)
		return toc
		// console.log(reactVDOM.filter(each => each.type === typeEnum.Header))
	}

	return (
		// <div className="py-32 flex flex-row justify-center">
			// <div className="px-6 w-full max-w-screen-md">
		<React.Fragment>

				{/* Settings */}
				<FixedEditorSettings
					state={editorSettings}
					dispatch={editorSettingsDispatch}
				/>

				<div className="py-32 grid-toc-editor">

					{/* TODO: Add two-way binding? */}
					<div className="pb-12 grid-toc overflow-x-hidden">
						{(toc => (
							toc.length > 0 && (
								<React.Fragment>
									<div className="py-1 flex flex-row items-center transform scale-90 origin-left">
										{/* <svg class="mr-2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> */}
										<svg class="mr-2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7"></path></svg>
										<p className="font-medium text-xs tracking-widest text-gray-600">
											CONTENTS
										</p>
									</div>
									<ul>
										{toc.map(({ hash, children, subheaders }) => (
											<li key={hash}>
												<a href={`#${hash}`}>
													<h1 className="py-1 font-medium text-sm text-gray-600 hover:text-blue-500 truncate transition duration-300">
														{toInnerText(children) || (
															"Untitled"
														)}
													</h1>
												</a>
												{subheaders.length > 0 && (
													<ul>
														{subheaders.map(({ hash, children }) => (
															<li key={hash}>
																<a href={`#${hash}`}>
																	<h2 className="pl-4 py-1 font-medium text-sm text-gray-600 hover:text-blue-500 truncate transition duration-300">
																		{toInnerText(children) || (
																			"Untitled"
																		)}
																	</h2>
																</a>
															</li>
														))}
													</ul>
												)}
											</li>
										))}
									</ul>
								</React.Fragment>
							)
						))(parseToC(editor.reactVDOM))}
					</div>

					{/* Editor section */}
					<div className="grid-editor">

						{/* Editor */}
						<DocumentTitle title={editorSettings.metadata.title || "Untitled"}>
							<Editor
								// className={editorSettings.debugCSS && "debug-css"}
								className="grid-editor"
								style={{ fontSize: 17 }}
								state={editor}
								dispatch={editorDispatch}
								readOnly={editorSettings.readOnly}
							/>
						</DocumentTitle>

						{/* Status bars */}
						{!editor.readOnly && (
							<div className="px-6 py-4 fixed inset-x-0 bottom-0 flex flex-row justify-between z-30 pointer-events-none">

								{/* LHS */}
								<div className="px-3 py-1 bg-white rounded-full shadow-hero pointer-events-auto">
									<p className="font-medium text-xs tracking-wide" style={{ fontFeatureSettings: "'tnum'" }}>
										{editor.pos1.pos === editor.pos2.pos ? (
											(() => {
												if (!editor.focused) {
													return "No selection"
												}
												return `Line ${commas(editor.pos1.y + 1)}, column ${commas(editor.pos1.x + 1)}`
											})()
										) : (
											((chars, lines) => {
												if (!editor.focused) {
													return "No selection"
												}
												return `Selected ${lines < 2 ? "" : `${commas(lines)} lines, `}${commas(chars)} character${chars === 1 ? "" : "s"}`
											})(editor.pos2.pos - editor.pos1.pos, editor.pos2.y - editor.pos1.y + 1)
										)}
									</p>
								</div>

								{/* RHS */}
								<div className="px-3 py-1 bg-white rounded-full shadow-hero pointer-events-auto">
									<p className="font-medium text-xs tracking-wide" style={{ fontFeatureSettings: "'tnum'" }}>
										{((words, minutes) => (
											`${commas(words)} word${words === 1 ? "" : "s"}${!minutes ? "" : `, est. ${commas(minutes)} minute read`}`
										))(editorSettings.metadata.words, editorSettings.metadata.minutes)}
									</p>
								</div>
							</div>
						)}

					</div>

				</div>

		</React.Fragment>

			// </div>
		// </div>
	)
}

export default App
