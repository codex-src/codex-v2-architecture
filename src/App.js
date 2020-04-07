import AppCode from "./AppCode"
import AppSettings from "./AppSettings"
import DocumentTitle from "./DocumentTitle"
import raw from "raw.macro"
import React from "react"
import RenderModes from "./Editor/RenderModes"

import "./App.css"

import {
	Editor,
	parseGFM,
	toHTML,
	toHTML__BEM,
	toText,
	// toString,
} from "./Editor/Editor"

// Parses a VDOM representation to other data types.
function parseTypes(data) {
	const types = {
		text: toText(data),
		html: toHTML(data),
		html__bem: toHTML__BEM(data),
	}
	return types
}

const RunesPerWord = 6
const WordsPerMinute = 250

// Parses a text representation to metadata.
function parseMetadata(text) {
	const runes = [...text].length
	const meta = {
		title: text.split("\n", 1),
		runes,
		words: text.split(/\s+/).filter(Boolean).length,
		seconds: Math.ceil(runes / RunesPerWord / WordsPerMinute * 60),
	}
	return meta
}

const KEY = "codex-app-v2.2"

const initialValue = (() => {
	const cache = localStorage.getItem(KEY)
	if (!cache) {
		return raw("./App.md")
	}
	const json = JSON.parse(cache)
	if (!json.data) {
		return raw("./App.md")
	}
	return json.data
})()

const App = props => {
	const textareaRef = React.useRef()
	const editorRef = React.useRef()

	// <textarea (1 of 2):
	const [value, setValue] = React.useState(() => initialValue)

	// Create state:
	const [state, setState] = React.useState(() => ({
		rect: { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 },
		renderMode: RenderModes.GFM,
		debugCSS: false,
		readOnly: false,
		raw: value,
		data: parseGFM(value),
		types: { text: "", html: "", html__bem: "" },
		metadata: { title: "", runes: 0, words: 0, seconds: 0 },
	}))

	// Update state:
	React.useEffect(() => {
		textareaRef.current.style.height = `${textareaRef.current.style.scrollHeight}px`

		let rect = null
		if (editorRef.current) {
			rect = editorRef.current.getBoundingClientRect()
		}
		const id = setTimeout(() => {
			const data = parseGFM(value)
			const types = parseTypes(data)
			setState(current => ({
				...current,
				rect,
				raw: value,
				data,
				types,
				metadata: parseMetadata(types.text),
			}))
			// Save to localStorage:
			localStorage.setItem(KEY, JSON.stringify({ data: value }))
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [value, state.renderMode])

	// Debug CSS:
	const mounted = React.useRef()
	React.useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		editorRef.current.classList.toggle("debug-css")
	}, [state.debugCSS])

	// Bind command-p for read-only:
	React.useEffect(() => {
		const handler = e => {
			if (!e.metaKey || e.keyCode !== 80) {
				// No-op
				return
			}
			e.preventDefault()
			setState(current => ({
				...current,
				readOnly: !state.readOnly,
			}))
		}
		window.addEventListener("keydown", handler)
		return () => {
			window.removeEventListener("keydown", handler)
		}
	}, [state.readOnly])

	// Bind tab:
	const tabHandler = e => {
		if (e.keyCode !== 9) {
			// No-op
			return
		}
		e.preventDefault()
		const textarea = textareaRef.current
		const { value, selectionStart: pos1, selectionEnd: pos2 } = textarea
		// eslint-disable-next-line prefer-template
		const newValue = value.slice(0, pos1) + "\t" + value.slice(pos2)
		Object.assign(textarea, {
			value: newValue,
			selectionStart: pos1 + "\t".length,
			selectionEnd: pos2 + "\t".length,
		})
		setValue(newValue)
	}

	return (
		<div className="flex flex-row justify-center">
			<div className="px-6 py-32 grid grid-cols-2 gap-12 w-full">

				{/* Settings */}
				<div className="p-3 fixed right-0 top-0 z-30">
					<AppSettings
						state={state}
						setState={setState}
					/>
				</div>

				{/* LHS */}
				<textarea
					ref={textareaRef}
					className="w-full h-full min-h-screen resize-none outline-none overflow-y-hidden"
					style={{ MozTabSize: 2, tabSize: 2 }}
					value={value}
					onKeyDown={tabHandler}
					onChange={e => setValue(e.target.value)}
				/>

				{/* RHS */}
				<DocumentTitle title={(state.metadata && state.metadata.title) || "Untitled"}>
					{state.renderMode === RenderModes.Text && (
						<AppCode
							style={{
								margin: "-0.5em 0",
								MozTabSize: 2,
								tabSize: 2,
							}}
							lang="text"
							children={state.types.text}
						/>
					)}
					{state.renderMode === RenderModes.GFM && (
						<Editor
							ref={editorRef}
							style={{ fontSize: 17 }}
							state={state}
							setState={setState}
						/>
					)}
					{state.renderMode === RenderModes.HTML && (
						<AppCode
							style={{
								margin: "-0.5em 0",
								MozTabSize: 2,
								tabSize: 2,
							}}
							lang="html"
							children={state.types.html}
						/>
					)}
					{state.renderMode === RenderModes.HTML__BEM && (
						<AppCode
							style={{
								margin: "-0.5em 0",
								MozTabSize: 2,
								tabSize: 2,
							}}
							lang="html"
							children={state.types.html__bem}
						/>
					)}
				</DocumentTitle>

			</div>
		</div>
	)
}

export default App
