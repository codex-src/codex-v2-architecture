import Button from "Button"
import DocumentTitle from "DocumentTitle"
import download from "download"
import Editor from "Editor/Editor"
import Highlighted from "Highlighted"
import raw from "raw.macro"
import React from "react"
import renderModesEnum from "EditorPreferences/renderModesEnum"
import StatusBars from "./StatusBars"
import Transition from "Transition"
import typeEnum from "Editor/typeEnum"
import useEditor from "Editor/useEditor"
import useEditorPreferences from "EditorPreferences/useEditorPreferences"
import useOutline from "./useOutline"
import useStatusBars from "./useStatusBars"
import { isMetaOrCtrlKey } from "Editor/detect"

import {
	toInnerText,
	toText,
} from "Editor/cmap"

// document.body.classList.toggle("debug-css")

const ReadmeEditor = ({ readOnly }) => {
	const [state, dispatch] = useEditor(raw("./Readme.md"))
	return (
		<Editor
			style={{ fontSize: 15 }}
			state={state}
			dispatch={dispatch}
			readOnly={readOnly}
		/>
	)
}

const FixedEditorPreferences = ({
	saveStatusState: [saveStatus, setSaveStatus],
	showOutlineState: [showOutline, setShowOutline],
	titleState: [title, setTitle],
	editorState: [editorState, editorStateDispatch], // TODO: Remove
	editorPrefs: [editorPrefs, editorPrefsDispatch],
}) => {

	const [y, setY] = React.useState(window.scrollY)

	React.useLayoutEffect(() => {
		const handler = e => {
			setY(window.scrollY)
		}
		handler()
		window.addEventListener("scroll", handler, false)
		return () => {
			window.removeEventListener("scroll", handler, false)
		}
	}, [])

	return (
		// NOTE: Use flex flex-col because of the sidebar
		<div className="p-4 pt-0 fixed inset-0 flex flex-col z-40 pointer-events-none">

			{/* <div className="bg-black">hello</div> */}

			{/* Preferences */}
			<Transition
				// NOTE: Use duration-200 not duration-300 and omit
				// transition-timing-function
				unmountOnExit={false}
				show={y > 0}
				enter="transition duration-200"
				enterFrom="bg-transparent shadow-none"
				enterTo="bg-white shadow-hero"
				leave="transition duration-200"
				leaveFrom="bg-white shadow-hero"
				leaveTo="bg-transparent shadow-none"
			>
				<div className="-mx-4 px-2 relative flex-shrink-0 flex flex-row justify-between">

					{/* LHS */}
					<div className="flex-shrink-0 flex flex-row pointer-events-auto">
						<Button
							// className="p-2 font-medium text-xxs"
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={() => setShowOutline(!showOutline)}
						>
							Outline ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "Ctrl-" : "⌘"}O)
						</Button>
						<Button
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.zoomOut}
						>
							Zoom Out
							<svg
								className="ml-1 w-4 h-4"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
							</svg>
						</Button>
						<Button
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.zoomIn}
						>
							Zoom In
							<svg
								className="ml-1 w-4 h-4"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{/* <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path> */}
								<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
							</svg>
						</Button>
						{/* <Button */}
						{/* 	className="p-2 flex flex-row items-center font-medium text-xxs transition duration-300" */}
						{/* 	onClick={editorPrefsDispatch.resetZoom} */}
						{/* > */}
						{/* 	Reset Zoom */}
						{/* </Button> */}
						<div
							className="p-2 flex flex-row items-center font-medium text-xxs transition duration-300"
							style={{ opacity: !saveStatus || saveStatus === 3 ? "0" : "1" }}
						>
							Saved
							<svg
								className="ml-1 p-px flex-shrink-0 w-4 h-4 text-green-500 transition duration-300"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								// strokeWidth="2"
								strokeWidth="3"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M5 13l4 4L19 7"></path>
							</svg>
						</div>
					</div>

					{/* RHS */}
					<div className="flex-shrink-0 flex flex-row pointer-events-auto">
						<Button
							// className="p-2 font-medium text-xxs"
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={() => {
								// FIXME
								editorStateDispatch.toggleReadOnly()
								editorPrefsDispatch.toggleReadOnly()
							}}
						>
							Preview ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "Control-" : "⌘"}P)
						</Button>
						<Button
							// className="p-2 font-medium text-xxs"
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.showReadme}
						>
							Readme (Esc)
						</Button>
						<Button
							// className="p-2 font-medium text-xxs"
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.showHTML}
						>
							HTML
						</Button>
						<Button
							// className="p-2 font-medium text-xxs"
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.showReact_js}
						>
							React JSX
						</Button>
					</div>

				</div>
			</Transition>

			{/* Sidebar */}
			<div className="flex-shrink-0 h-4" />
			<Transition
				show={editorPrefs.showSidebar}
				enter="transition ease-out duration-300"
				enterFrom="transform opacity-0 translate-x-32"
				enterTo="transform opacity-100 translate-x-0"
				leave="transition ease-in duration-300"
				leaveFrom="transform opacity-100 translate-x-0"
				leaveTo="transform opacity-0 translate-x-32"
			>
				<div className="p-6 self-end w-full max-w-lg max-h-full bg-white rounded-lg shadow-hero-lg overflow-y-scroll scrolling-touch pointer-events-auto">
					{editorPrefs.renderMode === renderModesEnum.Readme ? (
						<ReadmeEditor readOnly={editorPrefs.readOnly} />
					) : (
						<span className="inline-block">
							<pre className="whitespace-pre font-mono text-xs leading-snug subpixel-antialiased" style={{ MozTabSize: 2, tabSize: 2 }}>
								<Highlighted extension={editorPrefs.extension}>
									{editorPrefs[editorPrefs.renderMode]}
								</Highlighted>
							</pre>
						</span>
					)}
				</div>
			</Transition>

		</div>
	)
}

const LOCALSTORAGE_KEY = "codex-app-v2.4.1"

const data = (() => {
	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
	if (!cache) {
		return ""
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return ""
	}
	return json.data
})()

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

const App = () => {
	// TODO: Use props.children not useEditor?
	const [editorState, editorStateDispatch] = useEditor(data)
	const [editorPrefs, editorPrefsDispatch] = useEditorPreferences(renderModesEnum.Readme)

	const [title, setTitle] = React.useState("")

	const { statusLHS, statusRHS } = useStatusBars({ editorState })
	const { outline } = useOutline({ editorState })

	// Save status:
	//
	// 0 - Unsaved
	// 1 - Saving
	// 2 - Saved
	// 3 - Saved -- hidden
	//
	const [saveStatus, setSaveStatus] = React.useState(0)

	React.useEffect(() => {
		const handler = e => {
			if (!(isMetaOrCtrlKey(e) && e.keyCode === 83)) { // 83: S
				// No-op
				return
			}
			e.preventDefault()
			if (!window.confirm("Download a copy of your note?")) {
				// No-op
				return
			}
			download(`${title}.md`, new Blob([editorState.data, "\n"]))
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [editorState.data, title])

	const [showOutline, setShowOutline] = React.useState(true)

	// Manages table of outline.
	//
	// TODO: There is one bug when the table of outline is
	// hidden and then the window is resized; a passive event
	// listener needs to be added to handle this case
	React.useEffect(() => {
		const handler = e => {
			if (!(isMetaOrCtrlKey(e) && e.keyCode === 79)) { // 79: O
				// No-op
				return
			}
			e.preventDefault()
			setShowOutline(!showOutline)
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [showOutline])

	// Hovering table of outline header:
	const [hoverContents, setHoverContents] = React.useState(false)

	// Saves to localStorage (debounced).
	const mounted1 = React.useRef()
	React.useEffect(() => {
		if (!mounted1.current) {
			mounted1.current = true
			return
		}
		const ids = []
		ids.push(setTimeout(() => {
			// Debounce localStorage 100ms:
			const json = JSON.stringify({ data: editorState.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
			ids.push(setTimeout(() => {
				setSaveStatus(2)
				ids.push(setTimeout(() => {
					setSaveStatus(3)
				}, 1e3))
			}, 500))
		}, 100))
		return () => {
			[...ids].reverse().map(each => clearTimeout(each))
		}
	}, [editorState.data])

	React.useEffect(() => {
		const id = setTimeout(() => {
			const title = toText(editorState.reactVDOM.slice(0, 1)).split("\n", 1)[0]
			setTitle(title)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState])

	// Sets renderers (debounced).
	const mounted2 = React.useRef()
	React.useEffect(() => {
		if (!mounted2.current) {
			mounted2.current = true
			editorPrefsDispatch.update(editorState)
			return
		}
		if (!editorPrefs.showSidebar) {
			// No-op
			return
		}
		const id = setTimeout(() => {
			editorPrefsDispatch.update(editorState)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [
		// Logically sorted:
		editorState,
		editorPrefs.showSidebar,
		editorPrefsDispatch,
	])

	// Manages read-only mode.
	React.useEffect(() => {
		const handler = e => {
			if (!(isMetaOrCtrlKey(e) && e.keyCode === 80)) { // 80: P
				// No-op
				return
			}
			e.preventDefault()
			editorStateDispatch.toggleReadOnly()
			editorPrefsDispatch.toggleReadOnly()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [
		// Logically sorted:
		editorStateDispatch,
		editorPrefsDispatch,
	])

	// Manages sidebar.
	React.useEffect(() => {
		const handler = e => {
			if (!(e.keyCode === 27)) { // 27: Escape
				// No-op
				return
			}
			e.preventDefault()
			editorPrefsDispatch.toggleSidebar()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [editorPrefsDispatch])

	return (
		// NOTE: Use items-start for sticky
		<div className="px-6 py-32 flex flex-row justify-center items-start">

			{/* Preferences */}
			<FixedEditorPreferences
				saveStatusState={[saveStatus, setSaveStatus]}
				showOutlineState={[showOutline, setShowOutline]}
				titleState={[title, setTitle]}
				editorState={[editorState, editorStateDispatch]}
				editorPrefs={[editorPrefs, editorPrefsDispatch]}
			/>

			{/* LHS */}
			<Transition
				unmountOnExit={window.innerWidth <= 1328}
				show={showOutline}
				enter="transition ease-out duration-300"
				enterFrom="transform -translate-x-32"
				enterTo="opacity-100 transform translate-x-0 pointer-events-auto"
				leave="transition ease-in duration-300"
				leaveFrom="transform translate-x-0"
				leaveTo="opacity-0 transform -translate-x-32 pointer-events-none"
			>
				<React.Fragment>

					{/* Contents */}
					<div className="pb-12 sticky hidden lg:block w-48 overflow-x-hidden" style={{ top: 128 }}>
						<Button
							// NOTE: Use w-full text-left because of <Button>
							className="py-1 flex flex-row items-center w-full text-left text-gray-500 hover:text-blue-500 truncate transition duration-300"
							onPointerEnter={() => setHoverContents(true)}
							onPointerLeave={() => setHoverContents(false)}
							onClick={() => setShowOutline(false)}
						>
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
									// NOTE: Use duration-200 not duration-300
									// and omit transition-timing-function
									show={!hoverContents}
									enter="transition duration-200"
									enterFrom="opacity-0 transform -translate-x-8"
									enterTo="opacity-100 transform translate-x-0"
									leave="transition duration-200"
									leaveFrom="opacity-100 transform translate-x-0"
									leaveTo="opacity-0 transform -translate-x-8"
								>
									<path d="M4 6h16M4 12h16M4 18h7"></path>
								</Transition>
								<Transition
									// NOTE: Use duration-200 not duration-300
									// and omit transition-timing-function
									show={hoverContents}
									enter="transition duration-200"
									enterFrom="opacity-0 transform translate-x-8"
									enterTo="opacity-100 transform translate-x-0"
									leave="transition duration-200"
									leaveFrom="opacity-100 transform translate-x-0"
									leaveTo="opacity-0 transform translate-x-8"
								>
									<path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
								</Transition>
							</svg>
							<p className="font-semibold text-xxs tracking-wide uppercase truncate">
								{!hoverContents ? (
									title.trim() || "Untitled"
								) : (
									`Hide Outline (${navigator.userAgent.indexOf("Mac OS X") === -1 ? "Ctrl-" : "⌘"}O)`
								)}
							</p>
						</Button>
						<div className="h-2" />
						<ul>
							{outline.map(({ id, hash, secondary, children }) => (
								<li key={hash} onClick={e => newScrollHandler(e, id, hash)}>
									{id !== "" && (
										<a href={`#${hash}`}>
											<h1 className="py-1 font-medium text-sm truncate text-gray-600 hover:text-blue-500 transition duration-300">
												{children.trim() || "Untitled"}
											</h1>
										</a>
									)}
									<ul>
										{secondary.map(({ id, hash, children }) => (
											<li key={hash} onClick={e => newScrollHandler(e, id, hash)}>
												<a href={`#${hash}`}>
													<h2 className="pl-4 py-1 font-medium text-sm truncate text-gray-600 hover:text-blue-500 transition duration-300">
														{children.trim() || "Untitled"}
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

				</React.Fragment>
			</Transition>

			{/* RHS */}
			<div className="xl:flex-shrink-0 w-full max-w-3xl">

				{/* Editor */}
				<DocumentTitle title={title || "Untitled"}>
					<Editor
						// className="transition-all duration-75"
						style={{
							paddingBottom: "calc(100vh - 128px)",
							fontSize: editorPrefs.fontSize,
							transitionProperty: "font-size",
							// transitionDuration: "50ms",
						}}
						state={editorState}
						dispatch={editorStateDispatch}
						readOnly={editorPrefs.readOnly}
						autoFocus={!data.length}
					/>
				</DocumentTitle>

				<StatusBars editorState={[editorState, editorStateDispatch]} statusLHS={statusLHS} statusRHS={statusRHS} />

			</div>

			{/* Spacer */}
			<div className="hidden xl:block w-64"></div>

		</div>
	)
}

export default App
