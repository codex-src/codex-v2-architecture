import DocumentTitleAndEmoji from "lib/DocumentTitleAndEmoji"
import download from "lib/download"
import Editor from "Editor/Editor"
import FixedPreferences from "./FixedPreferences"
import isMetaOrCtrlKey from "lib/isMetaOrCtrlKey"
import LOCALSTORAGE_KEY from "./LOCALSTORAGE_KEY"
import Outline from "./Outline"
import raw from "raw.macro"
import React from "react"
import StatusBars from "./StatusBars"
import Transition from "lib/Transition"
import useDOMContentLoaded from "lib/useDOMContentLoaded"
import useEditor from "Editor/useEditor"
import useOutline from "./useOutline"
import usePreferences from "./Preferences/usePreferences"
import useSaveStatus from "./useSaveStatus"
import useStatusBars from "./useStatusBars"
import useTitleAndEmoji from "./useTitleAndEmoji"
import { toText } from "Editor/Elements/cmap"

import "./EditorApp.css"

// document.body.classList.toggle("debug-css")

// // https://reactjs.org/docs/error-boundaries.html#introducing-error-boundaries
// class ErrorBoundary extends React.Component {
// 	constructor(props) {
// 		super(props)
// 		this.state = {
// 			errored: false,
// 		}
// 	}
// 	static getDerivedStateFromError(error) {
// 		return { errored: true }
// 	}
// 	componentDidCatch(error, errorInfo) {
// 		// logErrorToMyService(error, errorInfo)
// 		console.error(error, errorInfo)
// 	}
// 	render() {
// 		// if (this.state.errored) {
// 		// 	return <h1>Something went wrong.</h1>
// 		// }
// 		return this.props.children
// 	}
// }

const data = (() => {
	const cache = localStorage.getItem(LOCALSTORAGE_KEY)
	if (!cache) {
		return raw("./EditorApp.md")
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return raw("./EditorApp.md")
	}
	return json.data
})()

const EditorApp = () => {
	const [state, dispatch] = useEditor(data)
	const [prefs, prefsDispatch] = usePreferences(state)

	const meta = useTitleAndEmoji(state)
	const outline = useOutline(state)
	const saveStatus = useSaveStatus(state)
	const [statusLHS, statusRHS] = useStatusBars(state)

	const DOMContentLoaded = useDOMContentLoaded()

	// Updates renderers.
	//
	// (1 of 2)
	React.useEffect(
		React.useCallback(() => {
			prefsDispatch.update(state)
		}, [state, prefsDispatch]),
		[],
	)
	//
	// (2 of 2)
	React.useEffect(
		React.useCallback(() => {
			if (!DOMContentLoaded || !prefs.showSidebar) {
				// No-op
				return
			}
			const id = setTimeout(() => {
				prefsDispatch.update(state)
			}, 16.67)
			return () => {
				clearTimeout(id)
			}
		}, [DOMContentLoaded, state, prefs, prefsDispatch]),
		[DOMContentLoaded, state.data, prefs.showSidebar],
	)

	React.useEffect(() => {
		const handleOpen = e => {
			if (!window.go_open) {
				// No-op
				return
			}

			if (!(e.metaKey && e.keyCode === 79)) { // "o"
				// No-op
				return
			}
			e.preventDefault()
			window.go_open().then(content => {
				console.log("dispatch.reset(content)")
				dispatch.reset(content)
			})
		}
		document.addEventListener("keydown", handleOpen)

		const handleSave = e => {
			if (!window.go_save) {
				// No-op
				return
			}

			if (!(e.metaKey && e.keyCode === 83)) { // "s"
				// No-op
				return
			}
			e.preventDefault()
			console.log("window.go_save(state.data)")
			window.go_save(state.data)
		}
		document.addEventListener("keydown", handleSave)

		return () => {
			document.removeEventListener("keydown", handleOpen)
			document.removeEventListener("keydown", handleSave)
		}
	}, [state.data, dispatch])

	// Shortcut: command-s.
	React.useEffect(
		React.useCallback(() => {
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
				const title = toText(state.elements.slice(0, 1)).split("\n", 1)[0]
				download(`${title}.md`, new Blob([state.data, "\n"]))
			}
			document.addEventListener("keydown", handler)
			return () => {
				document.removeEventListener("keydown", handler)
			}
		}, [state]),
		[state.data],
	)

	// Shortcut: command-p.
	React.useEffect(() => {
		const handler = e => {
			if (!(isMetaOrCtrlKey(e) && e.keyCode === 80)) { // 80: P
				// No-op
				return
			}
			e.preventDefault()
			dispatch.toggleReadOnly()
			prefsDispatch.toggleReadOnly()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [dispatch, prefsDispatch])

	// Shortcut: esc.
	React.useEffect(() => {
		const handler = e => {
			if (!(e.keyCode === 27)) { // 27: Escape
				// No-op
				return
			}
			e.preventDefault()
			prefsDispatch.toggleSidebar()
		}
		document.addEventListener("keydown", handler)
		return () => {
			document.removeEventListener("keydown", handler)
		}
	}, [prefsDispatch])

	return (
		// NOTE: Use items-start for sticky
		<div className="px-6 py-32 flex flex-row justify-center items-start">

			{/* Preferences */}
			<FixedPreferences
				stateTuple={[state, dispatch]}
				prefsTuple={[prefs, prefsDispatch]}
				saveStatus={saveStatus}
			/>

			{/* LHS */}
			<Transition
				unmountOnExit={window.innerWidth <= 1328}
				show={prefs.showOutline}
				enter="transition ease-out duration-300"
				enterFrom="transform -translate-x-32"
				enterTo="opacity-100 transform translate-x-0 pointer-events-auto"
				leave="transition ease-in duration-300"
				leaveFrom="transform translate-x-0"
				leaveTo="opacity-0 transform -translate-x-32 pointer-events-none"
			>
				<Outline title={meta.title} toggleOutline={prefsDispatch.toggleOutline}>
					{outline}
				</Outline>
			</Transition>

			{/* RHS */}
			<div className="flex-shrink-0 hidden lg:block w-16"></div>
			<div className="xl:flex-shrink-0 w-full max-w-3xl">
				<DocumentTitleAndEmoji title={(meta.title || "Untitled") + " (v0.7)"} emoji={meta.emoji}>
					<div className="relative">

						{/* Placeholder */}
						{(!state.readOnly && !state.data.length) && (
							<div className="absolute top-0 left-0 pointer-events-none opacity-50">
								<p className="text-gray-500 subpixel-antialiased" style={{ fontSize: prefs.fontSize }}>
									Hello, world!
								</p>
							</div>
						)}

						{/* Editor */}
						{/* <ErrorBoundary> */}
							<Editor
								style={{
									// paddingBottom: `calc(100vh - 128px - ${prefs.fontSize * 1.5}px)`,
									fontSize: prefs.fontSize,
									transitionProperty: "font-size",
									transitionDuration: "25ms",
									transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
								}}
								state={state}
								dispatch={dispatch}
								readOnly={prefs.readOnly}
								autoFocus={!data}
							/>
						{/* </ErrorBoundary> */}

					</div>
				</DocumentTitleAndEmoji>
				<Transition
					show={!state.readOnly}
					enter="transition duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<StatusBars>
						{[statusLHS, statusRHS]}
					</StatusBars>
				</Transition>

			</div>

			{/* Spacer */}
			<div className="hidden xl:block w-64"></div>

		</div>
	)
}

export default EditorApp
