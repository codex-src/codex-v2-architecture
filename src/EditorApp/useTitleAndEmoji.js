import React from "react"
import { atStart as emojiAtStart } from "emoji-trie"
import { atStart as runeAtStart } from "lib/encoding/utf8"
import { toText } from "Editor/Elements/cmap"

function useTitleAndEmoji(editorState) {
	// NOTE: Eagerly compute title because of <DocumentTitle>
	const [title, setTitle] = React.useState(() => toText(editorState.elements.slice(0, 1)).split("\n", 1)[0])
	const [emoji, setEmoji] = React.useState("")

	React.useEffect(() => {
		const id = setTimeout(() => {
			const title = toText(editorState.elements.slice(0, 1)).split("\n", 1)[0]
			setTitle(title)
		}, 16.67)
		return () => {
			clearTimeout(id)
		}
	}, [editorState])

	React.useEffect(() => {
		for (let x = 0, rune = ""; x < title.length; x += rune.length) {
			const info = emojiAtStart(title.slice(x))
			if (info) {
				setEmoji(info.emoji)
				break
			}
			rune = runeAtStart(title.slice(x))
		}
	}, [title])

	return { title, emoji }
}

export default useTitleAndEmoji
