import escape from "lodash/escape"

import {
	Blockquote,
	BquoteParagraph,
	Break,
	CodeBlock,
	Header,
	Image,
	List,
	ListItem,
	Paragraph,
	TaskItem,
} from "./Components"

import {
	A,
	Code,
	E,
	Em,
	Escape,
	Strike,
	Strong,
	StrongAndEm,
} from "./ComponentsText"

// Component maps.
//
/* eslint-disable no-multi-spaces */
const cmapText      = new Map()
const cmapHTML      = new Map()
const cmapHTML__BEM = new Map()
const cmapReact_js  = new Map()
/* eslint-enable no-multi-spaces */

// Parses a nested VDOM representation to a string.
export function toInnerString(children, cmap = cmapText) {
	const recurse = toInnerString

	let str = ""
	if (children === null || typeof children === "string") {
		if (cmap === cmapText) {
			return children || ""
		}
		return escape(children) || (cmap !== cmapReact_js ? "<br>" : "<br />")
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			str += recurse(each, cmap)
			continue
		}
		const fn = cmap[each.type.type || each.type]
		str += fn(each)
	}
	return str
}

// Parses a VDOM representation to a string.
function toString(data, cmap = cmapText) {
	let str = ""
	for (const each of data) {
		const fn = cmap[each.type.type || each.type]
		str += fn(each)
		if (each !== data[data.length - 1]) {
			str += "\n"
		}
	}
	return str
}

export function toText(data) {
	return toString(data, cmapText)
}
export function toHTML(data) {
	return toString(data, cmapHTML)
}
export function toHTML__BEM(data) {
	return toString(data, cmapHTML__BEM)
}
export function toReact_js(data) {
	return toString(data, cmapReact_js)
}

;(() => {
	/* eslint-disable no-multi-spaces */
	cmapText[Escape]                    = data => data.children
	cmapText[E]                         = data => toInnerString(data.children)
	cmapText[Em]                        = data => toInnerString(data.children)
	cmapText[Strong]                    = data => toInnerString(data.children)
	cmapText[StrongAndEm]               = data => toInnerString(data.children)
	cmapText[Code]                      = data => data.children
	cmapText[Strike]                    = data => toInnerString(data.children)
	cmapText[A]                         = data => toInnerString(data.children)
	cmapText[Header.type]               = data => toInnerString(data.children)
	cmapText[Paragraph.type]            = data => toInnerString(data.children)
	cmapText[BquoteParagraph.type]      = data => toInnerString(data.children)
	cmapText[Blockquote.type]           = data => toString(data.children)
	cmapText[CodeBlock.type]            = data => data.children.slice(0, -1)
	cmapText[ListItem.type]             = data => toInnerString(data.children)
	cmapText[TaskItem.type]             = data => toInnerString(data.children)
	cmapText[List.type]                 = data => toString(data.children)
	cmapText[Image.type]                = data => toInnerString(data.children)
	cmapText[Break.type]                = data => ""

	// TODO: Change <img ...> to <figure ...>
	cmapHTML[Escape]                    = data => data.children
	cmapHTML[E]                         = data => `<span aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML)}</span>`
	cmapHTML[Em]                        = data => `<em>${toInnerString(data.children, cmapHTML)}</em>`
	cmapHTML[Strong]                    = data => `<strong>${toInnerString(data.children, cmapHTML)}</strong>`
	cmapHTML[StrongAndEm]               = data => `<strong><em>${toInnerString(data.children, cmapHTML)}</em></strong>`
	cmapHTML[Code]                      = data => `<code>${toInnerString(data.children, cmapHTML)}</code>`
	cmapHTML[Strike]                    = data => `<strike>${toInnerString(data.children, cmapHTML)}</strike>`
	cmapHTML[A]                         = data => `<a href="${data.href}">${toInnerString(data.children, cmapHTML)}</a>`
	cmapHTML[Header.type]               = data => `<a href="#${data.hash}">\n\t<h1 id="${data.hash}">\n\t\t${toInnerString(data.children, cmapHTML)}\n\t</h1>\n</a>`
	cmapHTML[Paragraph.type]            = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[BquoteParagraph.type]      = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[Blockquote.type]           = data => `<blockquote>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	cmapHTML[CodeBlock.type]            = data => `<pre${!data.extension ? "" : ` class="language-${(data.extension).toLowerCase()}"`}><code><!--\n-->${toInnerString(data.children, cmapHTML).slice(0, -1)}<!--\n--></code></pre>`
	cmapHTML[ListItem.type]             = data => `<li>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	cmapHTML[TaskItem.type]             = data => `<li>\n\t<input type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	cmapHTML[List.type]                 = data => `<${data.tag}>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	cmapHTML[Image.type]                = data => `<img src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`
	cmapHTML[Break.type]                = data => "<hr>"

	// TODO: Change <img ...> to <figure ...>
	// TODO: BEM for <blockquote>
	cmapHTML__BEM[Escape]               = data => data.children
	cmapHTML__BEM[E]                    = data => `<span class="emoji" aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML__BEM)}</span>`
	cmapHTML__BEM[Em]                   = data => `<em class="em">${toInnerString(data.children, cmapHTML__BEM)}</em>`
	cmapHTML__BEM[Strong]               = data => `<strong class="strong">${toInnerString(data.children, cmapHTML__BEM)}</strong>`
	cmapHTML__BEM[StrongAndEm]          = data => `<strong class="strong"><em class="em">${toInnerString(data.children, cmapHTML__BEM)}</em></strong>`
	cmapHTML__BEM[Code]                 = data => `<code class="code">${toInnerString(data.children, cmapHTML__BEM)}</code>`
	cmapHTML__BEM[Strike]               = data => `<strike class="strike">${toInnerString(data.children, cmapHTML__BEM)}</strike>`
	cmapHTML__BEM[A]                    = data => `<a class="a" href="${data.href}" target="_blank">${toInnerString(data.children, cmapHTML__BEM)}</a>`
	cmapHTML__BEM[Header.type]          = data => `<a href="#${data.hash}">\n\t<${data.tag} id="${data.hash}" class="${data.tag}">\n\t\t${toInnerString(data.children, cmapHTML__BEM)}\n\t</${data.tag}>\n</a>`
	cmapHTML__BEM[Paragraph.type]       = data => `<p class="p${!data.emojis ? "" : ` emojis--${data.children.length}`}">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</p>`
	cmapHTML__BEM[BquoteParagraph.type] = data => `<p class="blockquote__p">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</p>`
	cmapHTML__BEM[Blockquote.type]      = data => `<blockquote class="blockquote">${`\n${toString(data.children, cmapHTML__BEM).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	cmapHTML__BEM[CodeBlock.type]       = data => `<pre class="pre"${!data.extension ? "" : ` class="language-${(data.extension).toLowerCase()}"`}><code class="pre__code"><!--\n-->${toInnerString(data.children, cmapHTML__BEM).slice(0, -1)}<!--\n--></code></pre>`
	cmapHTML__BEM[ListItem.type]        = data => `<li class="${data.tag}__li">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</li>`
	cmapHTML__BEM[TaskItem.type]        = data => `<li class="${data.tag}__li">\n\t<input class="${data.tag}__li__input--${!data.checked.value ? "unchecked" : "checked"}" type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</li>`
	cmapHTML__BEM[List.type]            = data => `<${data.tag} class="${data.tag}">${`\n${toString(data.children, cmapHTML__BEM).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	cmapHTML__BEM[Image.type]           = data => `<img class="img" src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`}>`
	cmapHTML__BEM[Break.type]           = data => "<hr class=\"hr\">"

	cmapReact_js[Escape]                = data => data.children
	cmapReact_js[E]                     = data => `<E>${toInnerString(data.children, cmapReact_js)}</E>`
	cmapReact_js[Em]                    = data => `<Em>${toInnerString(data.children, cmapReact_js)}</Em>`
	cmapReact_js[Strong]                = data => `<Strong>${toInnerString(data.children, cmapReact_js)}</Strong>`
	cmapReact_js[StrongAndEm]           = data => `<StrongEm>${toInnerString(data.children, cmapReact_js)}</StrongEm>`
	cmapReact_js[Code]                  = data => `<Code>${toInnerString(data.children, cmapReact_js)}</Code>`
	cmapReact_js[Strike]                = data => `<Strike>${toInnerString(data.children, cmapReact_js)}</Strike>`
	cmapReact_js[A]                     = data => `<A href="${data.href}">${toInnerString(data.children, cmapReact_js)}</A>`
	cmapReact_js[Header.type]           = data => `<a href="#${data.hash}">\n\t<Header${data.tag === "h1" ? "" : ` ${data.tag}`} id="${data.hash}">\n\t\t${toInnerString(data.children, cmapReact_js)}\n\t</Header>\n</a>`
	cmapReact_js[Paragraph.type]        = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[BquoteParagraph.type]  = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[Blockquote.type]       = data => `<Blockquote>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</Blockquote>`
	cmapReact_js[CodeBlock.type]        = data => `<Pre${!data.extension ? "" : ` info="${(data.extension).toLowerCase()}"`}>\n{\`${toInnerString(data.children.slice(0, -1)).replace(/`/g, "\\`")}\`}\n</Pre>`
	cmapReact_js[ListItem.type]         = data => `<Item>\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	cmapReact_js[TaskItem.type]         = data => `<Item>\n\t<Todo${!data.checked.value ? "" : " checked"} />\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	cmapReact_js[List.type]             = data => `<List${data.tag === "ul" ? "" : " ordered"}>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</List>`
	cmapReact_js[Image.type]            = data => `<Image src="${data.src}"${!data.alt ? "" : ` alt="${data.alt}"`} />`
	cmapReact_js[Break.type]            = data => "<Break />"
	/* eslint-enable no-multi-spaces */
})()
