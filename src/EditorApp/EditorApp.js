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
	const [editorState, editorStateDispatch] = useEditor(data)
	const [editorPrefs, editorPrefsDispatch] = usePreferences(editorState)

	const [showOutline, setShowOutline] = React.useState(true)

	const [[lhs, rhs]] = useStatusBars(editorState)
	const [outline] = useOutline(editorState)
	const [saveStatus] = useSaveStatus(editorState)
	const [title] = useTitle(editorState)

	// Updates renderers.
	const mounted = React.useRef()
	React.useEffect(
		React.useCallback(() => {
			if (!mounted.current || !editorPrefs.showSidebar) {
				mounted.current = true
				return
			}
			const id = setTimeout(() => {
				editorPrefsDispatch.update(editorState)
			}, 16.67)
			return () => {
				clearTimeout(id)
			}
		}, [editorState, editorPrefs, editorPrefsDispatch]),
		[editorPrefs.showSidebar],
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
				const title = toText(editorState.reactVDOM.slice(0, 1)).split("\n", 1)[0]
				download(`${title}.md`, new Blob([editorState.data, "\n"]))
			}
			document.addEventListener("keydown", handler)
			return () => {
				document.removeEventListener("keydown", handler)
			}
		}, [editorState]),
		[editorState.data],
	)

	// Shortcut: command-p.
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
	}, [editorStateDispatch, editorPrefsDispatch])

	// Shortcut: esc.
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
			<FixedPreferences
				saveStatus={saveStatus}
				editorPrefsTuple={[editorPrefs, editorPrefsDispatch]}
				showOutlineTuple={[showOutline, setShowOutline]}
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
				<Outline showOutlineTuple={[showOutline, setShowOutline]}>
					{outline}
				</Outline>
			</Transition>

			{/* RHS */}
			<div className="flex-shrink-0 hidden lg:block w-16"></div>
			<div className="xl:flex-shrink-0 w-full max-w-3xl">
				<DocumentTitle title={title || "Untitled"}>
					<Editor
						style={{
							paddingBottom: "calc(100vh - 128px)",
							fontSize: editorPrefs.fontSize,
							// transitionProperty: "font-size",
							// transitionDuration: "50ms",
						}}
						state={editorState}
						dispatch={editorStateDispatch}
						readOnly={editorPrefs.readOnly}
						autoFocus={!data.length}
					/>
				</DocumentTitle>
				<Transition
					// NOTE: Use duration-200 not duration-300 and
					// omit transition-timing-function
					show={!editorState.readOnly}
					enter="transition duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<StatusBars>
						{[lhs, rhs]}
					</StatusBars>
				</Transition>

			</div>

			{/* Spacer */}
			<div className="hidden xl:block w-64"></div>

		</div>
	)
}

export default App
