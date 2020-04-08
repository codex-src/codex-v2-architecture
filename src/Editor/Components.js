import attrs from "./attrs"
import Markdown from "./Markdown"
import Prism from "../Prism"
import React from "react"
import useEditorState from "./useEditorState"

import {
	CompoundNode,
	Node,
} from "./ComponentsHOC"

// Parses a nested VDOM representation to React components.
function toInnerReact(children) {
	const recurse = toInnerReact

	if (children === null || typeof children === "string") {
		return children
	}
	const components = []
	for (const each of children) {
		if (each === null || typeof each === "string") {
			components.push(recurse(each))
			continue
		}
		const { type: Type, ...props } = each
		components.push((
			<Type key={components.length} {...props}>
				{recurse(props.children)}
			</Type>
		))
	}
	return components
}

// Cuts extraneous spaces.
function cutSpaces(str) {
	const trimmed = str
		.replace(/ +/, " ") // Trims extra spaces
		.trim() // Trims start and end spaces
	return trimmed
}

const headerClassNames = {
	h1: cutSpaces("font-medium   text-3xl leading-tight"),
	h2: cutSpaces("font-medium   text-2xl leading-tight"),
	h3: cutSpaces("font-semibold text-xl  leading-tight"),
	h4: cutSpaces("font-semibold text-xl  leading-tight"),
	h5: cutSpaces("font-semibold text-xl  leading-tight"),
	h6: cutSpaces("font-semibold text-xl  leading-tight"),
}

export const Header = React.memo(({ tag, id, syntax, hash, data }) => (
	<Node id={id}>
		<a id={hash} href={`#${hash}`}>
			<div className={headerClassNames[tag]}>
				<Markdown syntax={syntax}>
					{toInnerReact(data) || (
						<br />
					)}
				</Markdown>
			</div>
		</a>
	</Node>
))

export const Paragraph = React.memo(({ id, emojis, data }) => (
	<Node id={id} className={!emojis ? null : `emojis emojis-${data.length}`}>
		{toInnerReact(data) || (
			<br />
		)}
	</Node>
))

export const BquoteParagraph = React.memo(({ id, syntax, data }) => {
	const [state] = useEditorState()

	const style = state.readOnly && { paddingLeft: "calc((14.453 + 8) / 16 * 1em)" }
	return (
		<Node id={id} className="text-gray-600" style={style}>
			<Markdown className="mr-2 text-md-blue-a400" syntax={syntax}>
				{toInnerReact(data) || (
					<br />
				)}
			</Markdown>
		</Node>
	)
})

// NOTE: Compound component
export const Blockquote = React.memo(({ id, data }) => {
	const [state] = useEditorState()

	const style = state.readOnly && { boxShadow: "inset 0.125em 0 var(--gray-600)" }
	return (
		<CompoundNode id={id} style={style}>
			{data.map(({ type: Type, children: data, ...each }) => (
				<Type key={each.id} data={data} {...each} />
			))}
		</CompoundNode>
	)
})

// NOTE: Compound component
export const CodeBlock = React.memo(({ id, syntax, info, data }) => {
	const [state] = useEditorState()

	const [html, setHTML] = React.useState(null)

	React.useEffect(() => {
		const language = info.split(".").slice(-1)[0].toLowerCase()
		if (!language) {
			// No-op
			return
		}
		const parser = Prism[language]
		if (!parser) {
			// No-op
			return
		}
		setHTML((
			<div className={language && `language-${language}`} dangerouslySetInnerHTML={{
				__html: window.Prism.highlight(data, parser, language),
			}} />
		))
	}, [info, data])

	return (
		<CompoundNode className="-mx-6 px-6 bg-white shadow-hero rounded" {...attrs.code}>
			<div className="break-words font-mono text-sm leading-snug">
				<Node className="py-px leading-none text-md-blue-a400">
					<Markdown syntax={[syntax[0]]}>
						{state.readOnly && (
							<br />
						)}
					</Markdown>
				</Node>
				<Node>
					{html || (
						data
					)}
				</Node>
				<Node className="py-px leading-none text-md-blue-a400">
					<Markdown syntax={[syntax[1]]}>
						{state.readOnly && (
							<br />
						)}
					</Markdown>
				</Node>
			</div>
		</CompoundNode>
	)
})

export const ListItem = React.memo(({ syntax, depth, checked, data }) => (
	<Node tag="li" className="-ml-5 my-2 flex flex-row">
		<Markdown className="mr-2 text-md-blue-a400" syntax={syntax} {...attrs.li}>
			<span>{toInnerReact(data)}</span>
		</Markdown>
	</Node>
))

const Checkbox = ({ className, ...props }) => (
	<input className={`form-checkbox ${className}`} type="checkbox" {...props} />
)

// Prepares a checked state and functions e.g. {...attrs}.
function useChecked(initialValue) {
	const [checked, setChecked] = React.useState(initialValue)
	const attrs = {
		checked,
		onChange: e => {
			setChecked(!checked)
		},
	}
	return [checked, attrs]
}

export const TaskItem = React.memo(({ syntax, checked, data }) => {
	const [$checked, $attrs] = useChecked(checked.value)

	const style = {
		margin: "0.3125em 0.5em 0 calc((16 - 11.266) / 16 * -1em)",
		borderRadius: "0.3125em",
	}
	return (
		<Node tag="li" className="checked -ml-5 my-2 flex flex-row" style={$checked && attrs.strike.style}>
			<Markdown className="hidden" syntax={syntax}>
				{/* NOTE: Use md-blue-a200 because md-blue-a400 is
				too dark and overwritten by attrs.strike.style */}
				<Checkbox className={`flex-shrink-0 w-4 h-4 text-md-blue-a200 ${!$checked ? "shadow-hero" : "shadow"} transition duration-150`} style={style} {...$attrs} />
				<span>{toInnerReact(data)}</span>
			</Markdown>
		</Node>
	)
})

// NOTE: Compound component
export const List = React.memo(({ tag, id, data }) => (
	<Node tag={tag} id={id} className="ml-5">
		{data.map(({ type: Type, children: data, ...each }) => (
			<Type key={each.id} data={data} {...each} />
		))}
	</Node>
))

const Caption = ({ syntax, data }) => (
	<div className="px-2 py-1 bg-white rounded shadow-hero truncate pointer-events-auto">
		<Markdown syntax={syntax}>
			{toInnerReact(data)}
		</Markdown>
	</div>
)

// Prepares a hovered state and functions e.g. {...attrs}.
function useHovered(initialValue) {
	const [hovered, setHovered] = React.useState(initialValue)
	const attrs = {
		onMouseEnter: e => {
			setHovered(true)
		},
		onMouseLeave: e => {
			setHovered(false)
		},
	}
	return [hovered, attrs]
}

export const Image = React.memo(({ id, syntax, src, alt, data }) => {
	const [state] = useEditorState()

	const [loaded, setLoaded] = React.useState(false)
	const [hovered, $attrs] = useHovered(state.readOnly)

	const divStyle = {
		opacity: state.readOnly && (!data || !hovered) ? "0%" : "100%",
	}
	// TODO: Guard state.rect?
	//
	// let imgStyle = null
	// if (state.rect) {
	// 	Object.assign(imgStyle,
	// 		maxWidth:  state.rect && state.rect.width,
	// 		maxHeight: state.rect && state.rect.width * 10 / 16,
	// 	})
	// }
	const imgStyle = {
		// minHeight: "3em",
		maxWidth:  state.rect && state.rect.width,
		minHeight: !loaded ? state.rect && state.rect.width * 9 / 16 : 0,
		maxHeight: state.rect && state.rect.width * 9 / 16,
	}
	return (
		<Node id={id} className="relative flex flex-row justify-center">
			<div className="absolute inset-0 pointer-events-none" style={divStyle}>
				<div className="px-8 py-2 flex flex-row justify-center items-end h-full">
					<Caption syntax={syntax} data={data} />
				</div>
			</div>
			{/* <div style={{opacity: !loaded ? "0%" : "100%" }} {...$attrs}> */}
			<div className={!loaded ? "w-full text-transparent bg-gray-100" : ""} {...$attrs}>
				<img className="mx-auto" style={imgStyle} src={src} alt={alt} onLoad={e => setLoaded(true)} />
			</div>
		</Node>
	)
})

export const Break = React.memo(({ id, syntax }) => {
	const [state] = useEditorState()
	return (
		<Node id={id}>
			<Markdown syntax={syntax}>
				{state.readOnly && (
					<hr className="inline-block w-full" style={{ verticalAlign: "15%" }} />
				)}
			</Markdown>
		</Node>
	)
})
