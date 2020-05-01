import React from "react"
import Transition from "Transition"

// TODO: Use preferences instead of statusLHS and statusRHS
const StatusBars = ({ editorState: [editorState, editorDispatch], statusLHS, statusRHS }) => (
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
		<div className="fixed inset-0 hidden xl:flex flex-row items-end pointer-events-none">
			<div className="px-3 py-2 flex flex-row justify-between w-full">
				<p className="font-medium text-xxs pointer-events-auto" style={{ fontFeatureSettings: "'tnum'" }}>
					{statusLHS}
				</p>
				<p className="font-medium text-xxs pointer-events-auto" style={{ fontFeatureSettings: "'tnum'" }}>
					{statusRHS}
				</p>
			</div>
		</div>
	</Transition>
)

export default StatusBars
