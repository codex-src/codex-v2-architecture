import Button from "Button"
import Editor from "Editor2/Editor"
import Highlighted from "Highlighted"
import Icon from "Icon"
import keyCodes from "Editor2/keyCodes"
import raw from "raw.macro"
import React from "react"
import renderModesEnum from "EditorSettings/renderModesEnum"
import Transition from "Transition"
import useEditor from "Editor2/useEditor"
import useEditorSettings from "EditorSettings/useEditorSettings"

import "./App.css"

const ArrowLeftOutlineMd = React.forwardRef((props, ref) => (
	<svg ref={ref} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" {...props}>
		<path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
	</svg>
))
const XOutlineMd = React.forwardRef((props, ref) => (
	<svg ref={ref} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" {...props}>
		<path d="M6 18L18 6M6 6l12 12" />
	</svg>
))

// const LOCALSTORAGE_KEY = "codex-app-v2.3"
//
// const data = (() => {
// 	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
// 	if (!cache) {
// 		return raw("./App.md")
// 	}
// 	const json = JSON.parse(cache)
// 	if (!json.data) {
// 		return raw("./App.md")
// 	}
// 	return json.data
// })()

const data = `I seriously agree with this article. I find TypeScript to be a kind of exchange of productivity for correctness, which, to be honest, in the real-world is less practical. Think about it this way — would you rather have end-to-end tests that test your production-ready application or TypeScript complain in development? Think carefully, because the answer is not obvious. **TypeScript takes time to get right. A lot of time. This is time you could be testing your application _in the wild_, rather than testing its correctness in development.** Yes, there _is_ some crossover here, but it’s not 100%. When you use TypeScript, you are **betting on TypeScript** helping you more than hurting you.

What I’m trying to say is that TypeScript is a _very steep bet_. But something about this is unsettling — Go is not dynamic, and I find writing Go to be easier than TypeScript, so what gives? I actually think the crux of the problem is that TypeScript is trying to fix JavaScript. _But what if JavaScript doesn’t need fixing?_ Then TypeScript actually doesn’t pay for itself. I say all of this as a cautionary tale for developers. I’ve been turned on and off multiple times by TypeScript. Ultimately, I think that some languages introduce so much complexity up front that if you try to wrangle them in later, you’re optimizing for the wrong problem.

I’m sure some of you will say that TypeScript makes you more productive, and if you are one of these people, that’s great. But I found I ran into similar problems as Lucas — TypeScript’s documentation and error messages are far from friendly, and TypeScript as a system starts to break down the more complexity you introduce into your app, e.g. recursive types, etc. I’m having bugs where my IDE and app don’t even agree. And I simply don’t have the time to find the root cause of every problem I run into, because most of these problems are concerned with correctness.`

const ReadmeEditor = () => {
	const [state, dispatch] = useEditor(raw("./Readme.md"))
	return <Editor style={{ fontSize: 15 }} state={state} dispatch={dispatch} />
}

const FixedEditorSettings = ({ state, dispatch }) => (
	<div className="p-3 fixed inset-0 z-30 pointer-events-none">
		<div className="flex flex-col items-end h-full">
			<div className="-m-1 flex-shrink-0 flex flex-row pointer-events-auto">
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.showReadme}
				>
					Readme
				</Button>
				{/* <Button */}
				{/* 	className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75" */}
				{/* 	onClick={dispatch.showJSON} */}
				{/* > */}
				{/* 	JSON */}
				{/* </Button> */}
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.showHTML}
				>
					HTML
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.showHTML__BEM}
				>
					HTML (BEM)
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={dispatch.showReact_js}
				>
					React (JSX)
				</Button>
				<Button
					// NOTE: Uses rounded-full instead of rounded-lg
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-full shadow transition duration-75"
					onClick={dispatch.toggleShow}
				>
					<Icon className="w-4 h-4" svg={!state.show ? ArrowLeftOutlineMd : XOutlineMd} />
				</Button>
			</div>
			<Transition
				show={state.show}
				enter="transition ease-out duration-300"
				enterFrom="transform opacity-0 translate-x-64"
				enterTo="transform opacity-100 translate-x-0"
				leave="transition ease-in duration-300"
				leaveFrom="transform opacity-100 translate-x-0"
				leaveTo="transform opacity-0 translate-x-64"
			>
				<div className="my-6 p-6 w-full max-w-lg max-h-full bg-white rounded-lg shadow-hero-lg overflow-y-scroll scrolling-touch pointer-events-auto">
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
	</div>
)

const App = () => {
	// TODO: Can we use props.children instead of useEditor?
	const [editorState, editorDispatch] = useEditor(data)
	const [editorSettings, editorSettingsDispatch] = useEditorSettings(renderModesEnum.Readme)

	// // Writes editorState.data to localStorage.
	// React.useEffect(() => {
	// 	const id = setTimeout(() => {
	// 		const json = JSON.stringify({ data: editorState.data })
	// 		localStorage.setItem(LOCALSTORAGE_KEY, json)
	// 	}, 100)
	// 	return () => {
	// 		clearTimeout(id)
	// 	}
	// }, [editorState.data])

	// Debounces editorSettingsDispatch.update by one frame.
	React.useEffect(() => {
		if (!editorSettings.show) {
			// No-op
			return
		}
		const id = setTimeout(() => {
			editorSettingsDispatch.update(editorState)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState, editorSettings, editorSettingsDispatch])

	// Binds read-only shortcut (macOS).
	//
	// TODO: Make shortcut cross-platform.
	React.useEffect(() => {
		const handler = e => {
			if (!e.metaKey || e.keyCode !== keyCodes.P) {
				// No-op
				return
			}
			e.preventDefault()
			editorDispatch.toggleReadOnly()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [editorDispatch])

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">

				<FixedEditorSettings
					state={editorSettings}
					dispatch={editorSettingsDispatch}
				/>

				<Editor
					style={{ fontSize: 17 }}
					state={editorState}
					dispatch={editorDispatch}
					// readOnly
				/>

			</div>
		</div>
	)
}

export default App
