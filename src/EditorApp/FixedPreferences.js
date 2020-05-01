import Button from "Button"
import Highlighted from "Highlighted"
import React from "react"
import ReadmeEditor from "./ReadmeEditor"
import renderModesEnum from "EditorPreferences/renderModesEnum"
import Transition from "Transition"

const FixedPreferences = ({
	saveStatus,
	editorPrefsTuple: [editorPrefs, editorPrefsDispatch],
	showOutlineTuple: [showOutline, setShowOutline],
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
		// NOTE: Use flex flex-col for the sidebar
		<div className="p-4 pt-0 fixed inset-0 flex flex-col z-40 pointer-events-none">

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
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.toggleReadOnly}
						>
							Preview ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "Control-" : "⌘"}P)
						</Button>
						<Button
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.showReadme}
						>
							Readme (Esc)
						</Button>
						<Button
							className="p-2 flex flex-row items-center font-medium text-xxs"
							onClick={editorPrefsDispatch.showHTML}
						>
							HTML
						</Button>
						<Button
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

export default FixedPreferences
