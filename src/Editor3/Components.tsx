import * as Types from "./__types"
import Markdown from "./Markdown"
import React from "react"

import {
	Root,
} from "./HOC"

// Parses an array of parsed data structures to renderable
// React components.
function toReact(parsed: string): React.ReactNode {
	const recurse = toReact

	if (parsed === null || typeof parsed === "string") {
		return parsed
	}
	// const components = []
	// for (const each of parsed) {
	// 	if (each === null || typeof each === "string") {
	// 		components.push(recurse(each))
	// 		continue
	// 	}
	// 	const { type: T, ...props } = each
	// 	components.push(React.createElement(typeMap[T], {
	// 		key: components.length,
	// 		...props,
	// 	}, recurse(props.parsed)))
	// }
	// return components

	return "TODO"
}

// // Trims extraneous spaces.
// function trim(str: string): string {
// 	return str.replace(/ +/, " ") // Trims extra spaces
// }

const headerClassNames: {
	[key: string]: string,
} = {
	h1: "font-medium   text-3xl leading-tight", // trim("font-medium   text-3xl leading-tight"),
	h2: "font-medium   text-2xl leading-tight", // trim("font-medium   text-2xl leading-tight"),
	h3: "font-semibold text-xl  leading-tight", // trim("font-semibold text-xl  leading-tight"),
	h4: "font-semibold text-xl  leading-tight", // trim("font-semibold text-xl  leading-tight"),
	h5: "font-semibold text-xl  leading-tight", // trim("font-semibold text-xl  leading-tight"),
	h6: "font-semibold text-xl  leading-tight", // trim("font-semibold text-xl  leading-tight"),
}

// // console.log(headerClassNames["h1"])

export const Header = React.memo(({
	tag,
	id,
	syntax,
	parsed,
}: Types.HeaderElement) => (
	<Root id={id} className={headerClassNames[tag]}>
		<Markdown syntax={syntax}>
			{toReact(parsed) || (
				<br />
			)}
		</Markdown>
	</Root>
))

export const Paragraph = React.memo(({ id, parsed }: Types.ParagraphElement) => (
	<Root id={id}>
		{toReact(parsed) || (
			<br />
		)}
	</Root>
))
