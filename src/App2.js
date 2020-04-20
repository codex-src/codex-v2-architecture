import Button from "Button"
import Editor from "Editor2/Editor"
import Highlighted from "Highlighted"
import raw from "raw.macro"
import React from "react"
import renderModesEnum from "EditorSettings/renderModesEnum"
import Transition from "Transition"
import useEditor from "Editor2/useEditor"
import useEditorSettings from "EditorSettings/useEditorSettings"

import "./App.css"

const ReadmeEditor = () => {
	const [state, dispatch] = useEditor(raw("./Readme.md"))
	return <Editor style={{ fontSize: 15 }} state={state} dispatch={dispatch} />
}

const FixedEditorSettings = ({ state, dispatch }) => (
	// NOTE: Usese flex flex-col to make the sidebar  work
	<div className="p-3 pb-6 fixed inset-0 flex flex-col z-30 pointer-events-none">

		{/* Buttons */}
		<div className="flex-shrink-0 flex flex-row justify-between w-full">

			{/* LHS */}
			<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.toggleReadOnly}
				>
					Toggle read-only: {`${state.showReadOnly}`}
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.toggleCSSDebugger}
				>
					Toggle CSS debugger: {`${state.showCSSDebugger}`}
				</Button>
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
	 			{/* <Button */}
	 			{/* 	className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75" */}
	 			{/* 	onClick={dispatch.showHTML__BEM} */}
	 			{/* > */}
	 			{/* 	HTML (BEM) */}
	 			{/* </Button> */}
	 			<Button
	 				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
	 				onClick={dispatch.showReact_js}
	 			>
	 				React
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
					<ReadmeEditor />
				) : (
					<pre className="whitespace-pre-wrap font-mono text-xs leading-snug subpixel-antialiased" style={{ MozTabSize: 2, tabSize: 2 }}>
						<Highlighted extension={state.extension}>
							{state[state.renderMode]}
						</Highlighted>
					</pre>
				)}
			</div>
		</Transition>

	</div>
)

const keyCodeEsc = 27
const keyCodeP = 80

// const typeScriptRant = `I seriously agree with this article. I find TypeScript to be a kind of exchange of productivity for correctness, which, to be honest, in the real-world is less practical. Think about it this way — would you rather have end-to-end tests that test your production-ready application or TypeScript complain in development? Think carefully, because the answer is not obvious. **TypeScript takes time to get right. A lot of time. This is time you could be testing your application _in the wild_, rather than testing its correctness in development.** Yes, there _is_ some crossover here, but it’s not 100%. When you use TypeScript, you are **betting on TypeScript** helping you more than hurting you.
//
// What I’m trying to say is that TypeScript is a _very steep bet_. But something about this is unsettling — Go is not dynamic, and I find writing Go to be easier than TypeScript, so what gives? I actually think the crux of the problem is that TypeScript is trying to fix JavaScript. _But what if JavaScript doesn’t need fixing?_ Then TypeScript actually doesn’t pay for itself. I say all of this as a cautionary tale for developers. I’ve been turned on and off multiple times by TypeScript. Ultimately, I think that some languages introduce so much complexity up front that if you try to wrangle them in later, you’re optimizing for the wrong problem.
//
// I’m sure some of you will say that TypeScript makes you more productive, and if you are one of these people, that’s great. But I found I ran into similar problems as Lucas — TypeScript’s documentation and error messages are far from friendly, and TypeScript as a system starts to break down the more complexity you introduce into your app, e.g. recursive types, etc. I’m having bugs where my IDE and app don’t even agree. And I simply don’t have the time to find the root cause of every problem I run into, because most of these problems are concerned with correctness.`
//
// const LOCALSTORAGE_KEY = "codex-app-v2.3"
//
// const data = (() => {
// 	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
// 	if (!cache) {
// 		return typeScriptRant // raw("./App.md")
// 	}
// 	const json = JSON.parse(cache)
// 	if (!json.data) {
// 		return typeScriptRant // raw("./App.md")
// 	}
// 	return json.data
// })()

const App = () => {
	// TODO: Can we use props.children instead of useEditor?
	const [editor, editorDispatch] = useEditor(`Hello, world!\n\n\`\`\`js\nexport const BlockquoteItem = React.memo(({ id, syntax, children }) => (\n	<Node id={id}>\n		<Markdown className="text-md-blue-a200" syntax={syntax}>\n			{toReact(children) || (\n				<br />\n			)}\n		</Markdown>\n	</Node>\n))\n\`\`\`\n\nHello, world!\n`)
	const [editorSettings, editorSettingsDispatch] = useEditorSettings(renderModesEnum.Readme)

	// Debounces renderers by one frame.
	React.useEffect(() => {
		if (!editorSettings.showSidebar) {
			// No-op
			return
		}
		const id = setTimeout(() => {
			editorSettingsDispatch.update(editor)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editor, editorSettings, editorSettingsDispatch])

	// // Writes editor.data to localStorage (debounced 100ms).
	// React.useEffect(() => {
	// 	const id = setTimeout(() => {
	// 		const json = JSON.stringify({ data: editor.data })
	// 		localStorage.setItem(LOCALSTORAGE_KEY, json)
	// 	}, 100)
	// 	return () => {
	// 		clearTimeout(id)
	// 	}
	// // TODO: Can use [editor.reactVDOM] instead
	// }, [editor.data])

	// Binds read-only shortcut (macOS).
	//
	// TODO: Make shortcut cross-platform.
	React.useEffect(() => {
		const handler = e => {
			if (!e.metaKey || e.keyCode !== keyCodeP) {
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
	}, [editorDispatch, editorSettingsDispatch])

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

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">

				<FixedEditorSettings
					state={editorSettings}
					dispatch={editorSettingsDispatch}
				/>

				{/* TODO: Implement <DocumentTitle> pattern */}
				<Editor
					className={editorSettings.showCSSDebugger && "debug-css"}
					style={{ fontSize: 17 }}
					state={editor}
					dispatch={editorDispatch}
					readOnly={editorSettings.showReadOnly}
				/>

			</div>
		</div>
	)
}

export default App
