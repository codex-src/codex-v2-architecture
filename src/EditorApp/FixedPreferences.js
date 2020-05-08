import Button from "lib/Button"
import Highlighted from "./Highlighted"
import React from "react"
import Transition from "lib/Transition"

const FixedPreferences = ({
	stateTuple: [state, dispatch],
	prefsTuple: [prefs, prefsDispatch],
	saveStatus,
}) => (
	// NOTE: Use flex flex-col for the sidebar
	<div className="p-4 pt-0 fixed inset-0 flex flex-col z-40 pointer-events-none">

		{/* Preferences */}
		<div className="-mx-4 px-2 relative flex-shrink-0 flex flex-row justify-between">

			{/* LHS */}
			<div className="flex-shrink-0 flex flex-row pointer-events-auto">
				<Button
					className="p-2 font-medium text-xxs underline"
					onClick={prefsDispatch.toggleOutline}
				>
					Outline
				</Button>
				<Button
					className="p-2 font-medium text-xxs underline"
					onClick={prefsDispatch.zoomIn}
				>
					Zoom +
				</Button>
				<Button
					className="p-2 font-medium text-xxs underline"
					onClick={prefsDispatch.zoomOut}
				>
					Zoom -
				</Button>
				<div
					className="p-2 flex flex-row items-center font-medium text-xxs transition ease-out duration-500"
					style={{ opacity: !saveStatus || saveStatus === 3 ? "0" : "1" }}
				>
					Saved
					<svg
						className="ml-1 w-4 h-4 text-green-500 transform scale-90"
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
					className="p-2 flex flex-row items-center font-medium text-xxs underline"
					onClick={dispatch.toggleReadOnly}
				>
					Preview ({navigator.userAgent.indexOf("Mac OS X") === -1 ? "Control-" : "⌘"}P)
					{!state.readOnly ? (
						<svg
							className="ml-2 w-4 h-4 text-gray-500"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
						</svg>
					) : (
						<svg
							className="ml-2 w-4 h-4 text-gray-500"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" fillRule="evenodd"></path>
						</svg>
					)}
				</Button>
				<Button
					className="p-2 font-medium text-xxs underline"
					onClick={prefsDispatch.toggleSidebar}
				>
					HTML (Esc)
				</Button>
			</div>

		</div>

		{/* Sidebar */}
		<div className="flex-shrink-0 h-4" />
		<Transition
			unmountOnExit={false}
			show={prefs.showSidebar}
			enter="transition ease-out duration-300"
			enterFrom="transform opacity-0 translate-x-32"
			enterTo="transform opacity-100 translate-x-0 pointer-events-auto"
			leave="transition ease-in duration-300"
			leaveFrom="transform opacity-100 translate-x-0"
			leaveTo="transform opacity-0 translate-x-32 pointer-events-none"
		>
			{/* NOTE: leaveTo classes are duplicated at the end */}
			<div className="p-6 self-end w-full max-w-lg max-h-full bg-white rounded-lg shadow-hero-lg overflow-y-scroll scrolling-touch transform opacity-0 translate-x-32 pointer-events-none">
				<span className="inline-block">
					<pre className="font-mono text-xs leading-snug subpixel-antialiased" style={{ MozTabSize: 2, tabSize: 2 }}>
						<Highlighted extension={prefs.output.extension}>
							{prefs.output[prefs.renderMode]}
						</Highlighted>
					</pre>
				</span>
			</div>
		</Transition>

	</div>
)

export default FixedPreferences
