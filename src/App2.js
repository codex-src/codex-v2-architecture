import Editor from "Editor2/Editor"
import keyCodes from "Editor2/keyCodes"
import raw from "raw.macro"
import React from "react"
import useEditor from "Editor2/useEditor"

import "./App.css"

const LOCALSTORAGE_KEY = "codex-app-v2.3"

// Read from localStorage:
// const initialValue = (() => {
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

const initialValue = `I seriously agree with this article. I find TypeScript to be a kind of exchange of productivity for correctness, which, to be honest, in the real-world is less practical. Think about it this way — would you rather have end-to-end tests that test your production-ready application or TypeScript complain in development? Think carefully, because the answer is not obvious. **TypeScript takes time to get right. A lot of time. This is time you could be testing your application _in the wild_, rather than testing its correctness in development.** Yes, there _is_ some crossover here, but it’s not 100%. When you use TypeScript, you are **betting on TypeScript** helping you more than hurting you.

What I’m trying to say is that TypeScript is a _very steep bet_. But something about this is unsettling — Go is not dynamic, and I find writing Go to be easier than TypeScript, so what gives? I actually think the crux of the problem is that TypeScript is trying to fix JavaScript. _But what if JavaScript doesn’t need fixing?_ Then TypeScript actually doesn’t pay for itself. I say all of this as a cautionary tale for developers. I’ve been turned on and off multiple times by TypeScript. Ultimately, I think that some languages introduce so much complexity up front that if you try to wrangle them in later, you’re optimizing for the wrong problem.

I’m sure some of you will say that TypeScript makes you more productive, and if you are one of these people, that’s great. But I found I ran into similar problems as Lucas — TypeScript’s documentation and error messages are far from friendly, and TypeScript as a system starts to break down the more complexity you introduce into your app, e.g. recursive types, etc. I’m having bugs where my IDE and app don’t even agree. And I simply don’t have the time to find the root cause of every problem I run into, because most of these problems are concerned with correctness.`

const App = () => {
	// const [state, setState] = useEditor(initialValue)
	const [state, setState] = useEditor(`> Hello\n>`)

	// Write to localStorage:
	React.useEffect(() => {
		const id = setTimeout(() => {
			const data = state.data.map(each => each.raw).join("\n")
			localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ data }))
		}, 100)
		return () => {
			clearTimeout(id)
		}
	}, [state.data])

	// Binds read-only shortcut.
	React.useEffect(
		React.useCallback(() => {
			const handler = e => {
				if (!e.metaKey || e.keyCode !== keyCodes.P) {
					// No-op
					return
				}
				e.preventDefault()
				setState(current => ({
					...current,
					readOnly: !state.readOnly,
				}))
			}
			document.addEventListener("keydown", handler)
			return () => {
				document.removeEventListener("keydown", handler)
			}
		}, [state, setState]),
		[state.readOnly],
	)

	return (
		<div className="py-32 flex flex-row justify-center">
			<div className="px-6 w-full max-w-screen-md">

				<Editor
					tag="article"
					id="main-editor"
					// className="text-lg"
					style={{ fontSize: 17 }}
					state={state}
					setState={setState}
					// readOnly
				/>

			</div>
		</div>
	)
}

export default App
