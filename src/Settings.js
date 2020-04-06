import Button from "./Button"
import React from "react"
import RenderModes from "./RenderModes"

const Settings = ({ state, setState, ...props }) => (
	<div className="flex flex-col items-end">

		{/* Top */}
		<div className="-m-1 flex flex-row">
			<Button
				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
				onClick={e => setState({
					...state,
					renderMode: RenderModes.Text,
				})}
			>
				Plain text
			</Button>
			<Button
				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
				onClick={e => setState({
					...state,
					renderMode: RenderModes.GFM,
				})}
			>
				Markdown
			</Button>
			<Button
				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
				onClick={e => setState({
					...state,
					renderMode: RenderModes.HTML,
				})}
			>
				HTML
			</Button>
			<Button
				className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
				onClick={e => setState({
					...state,
					renderMode: RenderModes.JSON,
				})}
			>
				JSON
			</Button>
		</div>

		{/* Bottom */}
		<div className="h-2" />
		<div className="-m-1 flex flex-row">
			{state.renderMode === RenderModes.GFM && (
				<React.Fragment>
					<Button
						className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
						onClick={e => setState({
							...state,
							readOnly: !state.readOnly,
						})}
					>
						Toggle read-only: {String(state.readOnly)}
					</Button>
					<Button
						className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
						onClick={e => setState({
							...state,
							debugCSS: !state.debugCSS,
						})}
					>
						Toggle debug-css: {String(state.debugCSS)}
					</Button>
				</React.Fragment>
			)}
		</div>

	</div>
)

export default Settings
