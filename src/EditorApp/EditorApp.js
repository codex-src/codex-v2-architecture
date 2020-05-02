import DocumentTitle from "lib/DocumentTitle"
import download from "lib/download"
import Editor from "Editor/Editor"
import FixedPreferences from "./FixedPreferences"
import Outline from "./Outline"
import React from "react"
import StatusBars from "./StatusBars"
import Transition from "lib/Transition"
import useEditor from "Editor/useEditor"
import useOutline from "./useOutline"
import usePreferences from "./Preferences/usePreferences"
import useSaveStatus from "./useSaveStatus"
import useStatusBars from "./useStatusBars"
import useTitle from "./useTitle"
import { isMetaOrCtrlKey } from "Editor/detect"
import { LOCALSTORAGE_KEY } from "./constants"
import { toText } from "Editor/cmap"

// document.body.classList.toggle("debug-css")

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

const App = () => {
	const [state, dispatch] = useEditor(data)
	const [prefs, prefsDispatch] = usePreferences(state)

	// The status bar left-hand and right-hand side.
	const [[statusLHS, statusRHS]] = useStatusBars(state)

	// The outline data structure.
	const [showOutline, setShowOutline] = React.useState(true)
	const [outline] = useOutline(state)

	// The save status (number; 1-4).
	const [saveStatus] = useSaveStatus(state)

	// The plain text title.
	const [title] = useTitle(state)

	// Updates renderers.
	const mounted = React.useRef()
	React.useEffect(
		React.useCallback(() => {
			if (!mounted.current || !prefs.showSidebar) {
				mounted.current = true
				return
			}
			const id = setTimeout(() => {
				prefsDispatch.update(state)
			}, 16.67)
			return () => {
				clearTimeout(id)
			}
		}, [state, prefs, prefsDispatch]),
		[state.data, state.pos1, state.pos2],
	)

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
				const title = toText(state.reactVDOM.slice(0, 1)).split("\n", 1)[0]
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

	// TODO: Change to Provider API or consolidate to
	// usePreferences; rename to useEditorApp
	//
	// <Provider value={{
	// 	statusLHS,
	// 	statusRHS,
	// 	showOutline,
	// 	setShowOutline,
	// 	outline,
	// 	saveStatus,
	// 	title,
	//
	// 	state,
	// 	dispatch,
	// 	prefs,
	// 	prefsDispatch,
	// }}>
	//
	// </Provider>

		// NOTE: Use items-start for sticky
		<div className="px-6 py-32 flex flex-row justify-center items-start">

			{/* Preferences */}
			<FixedPreferences
				prefsTuple={[prefs, prefsDispatch]}
				showOutlineTuple={[showOutline, setShowOutline]}
				saveStatus={saveStatus}
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
				<Outline showOutlineTuple={[showOutline, setShowOutline]} title={title}>
					{outline}
				</Outline>
			</Transition>

			{/* RHS */}
			<div className="flex-shrink-0 hidden lg:block w-16"></div>
			<div className="xl:flex-shrink-0 w-full max-w-3xl">
				<DocumentTitle title={title || "Untitled"}>
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
						<Editor
							style={{ paddingBottom: "calc(100vh - 128px)", fontSize: prefs.fontSize }}
							state={state}
							dispatch={dispatch}
							readOnly={prefs.readOnly}
							autoFocus={!data.length}
						/>

					</div>
				</DocumentTitle>
				<Transition
					// NOTE: Use duration-200 not duration-300 and
					// omit transition-timing-function
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

export default App
