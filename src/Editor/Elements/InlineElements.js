import attrs from "./attrs"
import Markdown from "./Markdown"
import React from "react"

export const Escape = ({ syntax, children }) => (
	<Markdown syntax={syntax}>
		{children}
	</Markdown>
)

export const Emoji = ({ description, children }) => (
	<span aria-label={description} role="img">
		<Markdown>
			{children}
		</Markdown>
	</span>
)

export const Emphasis = ({ syntax, children }) => (
	<em>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</em>
)

export const Strong = ({ syntax, children }) => (
	<strong>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</strong>
)

export const StrongEmphasis = ({ syntax, children }) => (
	<strong>
		<em>
			<Markdown syntax={syntax}>
				{children}
			</Markdown>
		</em>
	</strong>
)

export const Code = ({ syntax, children }) => (
	<code {...attrs.disableAutoCorrect}>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</code>
)

export const Strikethrough = ({ syntax, children }) => (
	<strike>
		<Markdown syntax={syntax}>
			{children}
		</Markdown>
	</strike>
)

// TODO: Add <NakedAnchor>
export const Anchor = ({ syntax, href, children }) => {
	// const ref = React.useRef()
	//
	// const [show, setShow] = React.useState(false)
	//
	// React.useEffect(() => {
	// 	const handleSelectionChange = () => {
	// 		const selection = document.getSelection()
	// 		if (!selection || !selection.rangeCount) {
	// 			// No-op
	// 			return
	// 		}
	// 		const range = selection.getRangeAt(0)
	// 		// setShow(range.collapsed && ref.current.contains(range.startContainer))
	// 		setShow(ref.current.contains(range.commonAncestorContainer) || range.commonAncestorContainer.contains(ref.current))
	// 	}
	// 	document.addEventListener("selectionchange", handleSelectionChange)
	// 	return () => {
	// 		document.removeEventListener("selectionchange", handleSelectionChange)
	// 	}
	// }, [])

	return (
		<a /* ref={ref} */ href={href} {...attrs.a} onClick={() => console.log("test")}>
			<Markdown /* style={{ display: !show ? "none" : null }} */ syntax={!children || syntax} {...attrs.disableAutoCorrect}>
				{children || syntax}
			</Markdown>
		</a>
	)
}
