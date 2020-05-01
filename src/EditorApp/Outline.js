// import DocumentTitle from "DocumentTitle"
// import download from "download"
// import Editor from "Editor/Editor"
// import Highlighted from "Highlighted"
// import Outline from "./Outline"
// import React from "react"
// import ReadmeEditor from "./ReadmeEditor"
// import renderModesEnum from "EditorPreferences/renderModesEnum"
// import StatusBars from "./StatusBars"
// import useEditor from "Editor/useEditor"
// import useEditorPreferences from "EditorPreferences/useEditorPreferences"
// import useOutline from "./useOutline"
// import useStatusBars from "./useStatusBars"
// import useTitle from "./useTitle"
// import { isMetaOrCtrlKey } from "Editor/detect"

import Button from "Button"
import React from "react"
import Transition from "Transition"

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

const Outline = ({
	titleTuple: [title, setTitle],
	showOutlineTuple: [showOutline, setShowOutline],
	children: outline,
}) => {
	const [hoverOutline, setHoverOutline] = React.useState(false)
	return (
		<div className="pb-12 sticky hidden lg:block w-48 overflow-x-hidden" style={{ top: 128 }}>
			<Button
				// NOTE: Use w-full text-left because of <Button>
				className="py-1 flex flex-row items-center w-full text-left text-gray-500 hover:text-blue-500 truncate transition duration-300"
				onPointerEnter={() => setHoverOutline(true)}
				onPointerLeave={() => setHoverOutline(false)}
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
						show={!hoverOutline}
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
						show={hoverOutline}
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
					{!hoverOutline ? (
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
	)
}

export default Outline
