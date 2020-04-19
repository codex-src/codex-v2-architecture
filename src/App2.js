// import raw from "raw.macro"
import * as Hero from "react-heroicons"
import Button from "Button"
import Editor from "Editor2/Editor"
import Enum from "Enum"
import Highlighted from "Highlighted"
import Icon from "Icon"
import keyCodes from "Editor2/keyCodes"
import React from "react"
import Transition from "Transition"
import useEditor from "Editor2/useEditor"

import {
	toHTML,
	toHTML__BEM,
	toReact_js,
} from "./Editor2/cmap"

import "./App.css"

const LOCALSTORAGE_KEY = "codex-app-v2.3"

const renderModesEnum = new Enum(
	"JSON",
	"HTML",
	"HTML__BEM",
	"React_js",
)

// Read from localStorage:
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

const initialState = {
	show: false,
	renderMode: renderModesEnum.JSON,
	extension: "json",
	// ...renderModesEnum.keys().reduce((acc, each) => {
	// 	acc[each] = ""
	// 	return acc
	// }, {}),
	[renderModesEnum.JSON]: "",
	[renderModesEnum.HTML]: "",
	[renderModesEnum.HTML__BEM]: "",
	[renderModesEnum.React_js]: "",
}

const methods = state => ({
	toggleShow() {
		state.show = !state.show
	},
	setJSON() {
		state.show = true
		state.renderMode = renderModesEnum.JSON
		state.extension = "json"
	},
	setHTML() {
		state.show = true
		state.renderMode = renderModesEnum.HTML
		state.extension = "html"
	},
	setHTML__BEM() {
		state.show = true
		state.renderMode = renderModesEnum.HTML__BEM
		state.extension = "html"
	},
	setReact_js() {
		state.show = true
		state.renderMode = renderModesEnum.React_js
		state.extension = "jsx"
	},
})

const FixedSettings = ({ renderState, setRenderState }) => (
	<div className="p-3 fixed inset-0 z-30 pointer-events-none">
		<div className="flex flex-col items-end">
			<div className="-m-1 flex flex-row pointer-events-auto">
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={e => setRenderState({
						...renderState,
						show: true,
						renderMode: renderModesEnum.JSON,
						extension: "json",
					})}
				>
					JSON
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={e => setRenderState({
						...renderState,
						show: true,
						renderMode: renderModesEnum.HTML,
						extension: "html",
					})}
				>
					HTML
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={e => setRenderState({
						...renderState,
						show: true,
						renderMode: renderModesEnum.HTML__BEM,
						extension: "html",
					})}
				>
					HTML (BEM classes)
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg shadow transition duration-75"
					onClick={e => setRenderState({
						...renderState,
						show: true,
						renderMode: renderModesEnum.React_js,
						extension: "jsx",
					})}
				>
					React
				</Button>
				<Button
					className="m-1 px-3 py-2 bg-white hover:bg-gray-100 rounded-full shadow transition duration-75"
					onClick={e => setRenderState({
						...renderState,
						show: !renderState.show,
					})}
				>
					<Icon className="w-4 h-4" svg={!renderState.show ? Hero.ArrowLeftOutlineMd : Hero.XOutlineMd} />
				</Button>
			</div>
			<Transition
				show={renderState.show}
				enter="transition ease-out duration-300"
				enterFrom="transform opacity-0 translate-x-64"
				enterTo="transform opacity-100 translate-x-0"
				leave="transition ease-in duration-300"
				leaveFrom="transform opacity-100 translate-x-0"
				leaveTo="transform opacity-0 translate-x-64"
			>
				<div className="my-6 p-6 relative w-full max-w-lg h-full bg-white rounded-lg shadow-hero-lg overflow-y-scroll scrolling-touch pointer-events-auto" style={{ maxHeight: "36em" }}>
					<pre className="whitespace-pre-wrap font-mono text-xs leading-snug subpixel-antialiased" style={{ MozTabSize: 2, tabSize: 2 }}>
						<Highlighted extension={renderState.extension}>
							{renderState[renderState.renderMode]}
						</Highlighted>
					</pre>
				</div>
			</Transition>
		</div>
	</div>
)

const App = () => {
	// const [state, dispatch] = useEditor(`> Hello\n`)
	const [state, dispatch] = useEditor(data)

	// const [renderState, renderDispatch] = useSettings() // TODO: Add "JSON" as an argument
	const [renderState, setRenderState] = React.useState(() => ({
		show: false,
		renderMode: renderModesEnum.JSON,
		...renderModesEnum.keys().reduce((acc, each) => {
			acc[each] = ""
			return acc
		}, {}),
	}))

	// Write to localStorage:
	React.useEffect(() => {
		const id = setTimeout(() => {
			const json = JSON.stringify({ data: state.data })
			localStorage.setItem(LOCALSTORAGE_KEY, json)
		}, 100)
		return () => {
			clearTimeout(id)
		}
	}, [state.data])

	React.useEffect(() => {
		if (!renderState.show) {
			// No-op
			return
		}
		const id = setTimeout(() => {
			setRenderState(current => ({
				...current,
				[renderModesEnum.JSON]: JSON.stringify(
					{
						...state,
						data:      undefined,
						reactVDOM: undefined,
						reactDOM:  undefined,
					},
					null,
					"\t",
				),
				[renderModesEnum.HTML]:      toHTML(state.reactVDOM),
				[renderModesEnum.HTML__BEM]: toHTML__BEM(state.reactVDOM),
				[renderModesEnum.React_js]:  toReact_js(state.reactVDOM),
			}))
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [state, renderState])

	// Binds read-only shortcut (command-p).
	React.useEffect(
		React.useCallback(() => {
			// if (state.readOnly) {
			// 	// No-op
			// 	return
			// }
			const handler = e => {
				if (!e.metaKey || e.keyCode !== keyCodes.P) {
					// No-op
					return
				}
				e.preventDefault()
				dispatch.toggleReadOnly()
			}
			document.addEventListener("keydown", handler)
			return () => {
				document.removeEventListener("keydown", handler)
			}
		}, [dispatch]),
		[state.readOnly],
	)

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">

				<FixedSettings
					renderState={renderState}
					setRenderState={setRenderState}
				/>

				<Editor
					style={{ fontSize: 17 }}
					state={state}
					dispatch={dispatch}
					// readOnly
				/>

			</div>
		</div>
	)
}

export default App
