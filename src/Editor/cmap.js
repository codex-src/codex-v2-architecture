import escape from "lodash/escape"
import prismExtensions from "prismExtensions"
import typeEnum from "./typeEnum"

// Component maps.
//
/* eslint-disable no-multi-spaces */
const cmapText      = {}
const cmapHTML      = {}
const cmapHTML__BEM = {}
const cmapReact_js  = {}
/* eslint-enable no-multi-spaces */

const escapeReactMap = {
	"<": "&lt;",
	">": "&gt;",
	"{": "&#123;",
	"}": "&#125;",
}

// React-escapes a string.
//
// https://github.com/lodash/lodash/blob/3.0.0-npm-packages/lodash.escape/index.js
function reactEscape(str) {
	return (str || "").replace(/[<>{}]/g, char => escapeReactMap[char])
}

// Converts a nested VDOM representation to a string.
export function toInnerString(children, cmap = cmapText) {
	let str = ""
	if (children === null || typeof children === "string") {
		if (cmap === cmapText) {
			return children || ""
		}
		// Return an escaped string or a break:
		return (cmap !== cmapReact_js ? escape(children) : reactEscape(children)) ||
			(cmap !== cmapReact_js ? "<br>" : "<br />")
	}
	for (const each of children) {
		if (each === null || typeof each === "string") {
			str += toInnerString(each, cmap)
			continue
		}
		str += cmap[each.type](each)
	}
	return str
}

// Converts a VDOM representation to a string.
function toString(reactVDOM, cmap = cmapText) {
	let str = ""
	for (const each of reactVDOM) {
		str += cmap[each.type](each)
		if (each !== reactVDOM[reactVDOM.length - 1]) {
			str += "\n"
		}
	}
	return str
}

// Prism-parses code.
function parsePrism(code, extension) {
	const parser = prismExtensions[extension]
	if (!parser) {
		// No-op
		return escape(code)
	}
	return window.Prism.highlight(code, parser, extension)
}

;(() => {
	/* eslint-disable no-multi-spaces */
	cmapText[typeEnum.Escape]             = data => data.children
	cmapText[typeEnum.Emoji]              = data => toInnerString(data.children)
	cmapText[typeEnum.Emphasis]           = data => toInnerString(data.children)
	cmapText[typeEnum.Strong]             = data => toInnerString(data.children)
	cmapText[typeEnum.StrongEmphasis]     = data => toInnerString(data.children)
	cmapText[typeEnum.Code]               = data => data.children
	cmapText[typeEnum.Strikethrough]      = data => toInnerString(data.children)
	cmapText[typeEnum.Anchor]             = data => toInnerString(data.children)
	cmapText[typeEnum.Header]             = data => toInnerString(data.children)
	cmapText[typeEnum.Paragraph]          = data => toInnerString(data.children)
	cmapText[typeEnum.BlockquoteItem]     = data => toInnerString(data.children)
	cmapText[typeEnum.Blockquote]         = data => toString(data.children)
	cmapText[typeEnum.Preformatted]       = data => toInnerString(data.children.slice(1, -1).map(each => each.data).join("\n"))
	cmapText[typeEnum.AnyListItem]        = data => toInnerString(data.children)
	cmapText[typeEnum.TodoItem]           = data => toInnerString(data.children)
	cmapText[typeEnum.AnyList]            = data => toString(data.children)
	// cmapText[typeEnum.Image]           = data => toInnerString(data.children)
	cmapText[typeEnum.Break]              = data => ""

	cmapHTML[typeEnum.Escape]             = data => data.children
	cmapHTML[typeEnum.Emoji]              = data => `<span aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML)}</span>`
	cmapHTML[typeEnum.Emphasis]           = data => `<em>${toInnerString(data.children, cmapHTML)}</em>`
	cmapHTML[typeEnum.Strong]             = data => `<strong>${toInnerString(data.children, cmapHTML)}</strong>`
	cmapHTML[typeEnum.StrongEmphasis]     = data => `<strong><em>${toInnerString(data.children, cmapHTML)}</em></strong>`
	cmapHTML[typeEnum.Code]               = data => `<code>${toInnerString(data.children, cmapHTML)}</code>`
	cmapHTML[typeEnum.Strikethrough]      = data => `<strike>${toInnerString(data.children, cmapHTML)}</strike>`
	cmapHTML[typeEnum.Anchor]             = data => `<a href="${data.href}" target="_blank" rel="noopener noreferrer">${toInnerString(data.children, cmapHTML)}</a>`
	cmapHTML[typeEnum.Header]             = data => `<a href="#${data.hash}">\n\t<${data.tag} id="${data.hash}">\n\t\t${toInnerString(data.children, cmapHTML)}\n\t</${data.tag}>\n</a>`
	cmapHTML[typeEnum.Paragraph]          = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[typeEnum.BlockquoteItem]     = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[typeEnum.Blockquote]         = data => `<blockquote>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	// cmapHTML[typeEnum.Preformatted]    = data => `<pre${!data.extension ? "" : ` class="language-${data.extension.toLowerCase()}"`}><code><!--\n-->${toInnerString(data.children.slice(1, -1).map(each => each.data).join("\n"), cmapHTML)}<!--\n--></code></pre>`
	cmapHTML[typeEnum.Preformatted]       = data => `<pre${!data.extension ? "" : ` class="language-${data.extension.toLowerCase().replace("\"", "\\\"")}"`}><code><!--\n-->${parsePrism(data.children.slice(1, -1).map(each => each.data).join("\n"), data.extension)}<!--\n--></code></pre>`
	cmapHTML[typeEnum.AnyListItem]        = data => `<li>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	cmapHTML[typeEnum.TodoItem]           = data => `<li>\n\t<input type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	cmapHTML[typeEnum.AnyList]            = data => `<${data.tag}>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	// cmapHTML[typeEnum.Image]           = data => `<figure>\n\t<img src="${data.src}"${!data.alt ? "" : ` alt="${escape(data.alt)}"`}>${!data.alt ? "" : `\n\t<figcaption>\n\t\t${toInnerString(data.children, cmapHTML)}\n\t</figcaption>`}\n</figure>`
	cmapHTML[typeEnum.Break]              = data => "<hr>"

	cmapReact_js[typeEnum.Escape]         = data => data.children
	cmapReact_js[typeEnum.Emoji]          = data => `<E>${toInnerString(data.children, cmapReact_js)}</E>`
	cmapReact_js[typeEnum.Emphasis]       = data => `<Em>${toInnerString(data.children, cmapReact_js)}</Em>`
	cmapReact_js[typeEnum.Strong]         = data => `<Strong>${toInnerString(data.children, cmapReact_js)}</Strong>`
	cmapReact_js[typeEnum.StrongEmphasis] = data => `<StrongEm>${toInnerString(data.children, cmapReact_js)}</StrongEm>`
	cmapReact_js[typeEnum.Code]           = data => `<Code>${toInnerString(data.children, cmapReact_js)}</Code>`
	cmapReact_js[typeEnum.Strikethrough]  = data => `<Strike>${toInnerString(data.children, cmapReact_js)}</Strike>`
	cmapReact_js[typeEnum.Anchor]         = data => `<a href="${data.href}" target="_blank" rel="noopener noreferrer">${toInnerString(data.children, cmapReact_js)}</a>`
	cmapReact_js[typeEnum.Header]         = data => `<a href="#${data.hash}">\n\t<${data.tag.toUpperCase()} id="${data.hash}">\n\t\t${toInnerString(data.children, cmapReact_js)}\n\t</${data.tag.toUpperCase()}>\n</a>`
	cmapReact_js[typeEnum.Paragraph]      = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[typeEnum.BlockquoteItem] = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[typeEnum.Blockquote]     = data => `<Blockquote>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</Blockquote>`
	cmapReact_js[typeEnum.Preformatted]   = data => `<Pre${!data.info ? "" : ` info="${data.info.replace("\"", "\\\"")}"`}>\n{\`${toInnerString(data.children.slice(1, -1).map(each => each.data).join("\n")).replace(/`/g, "\\`")}\`}\n</Pre>`
	cmapReact_js[typeEnum.AnyListItem]    = data => `<Item>\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	cmapReact_js[typeEnum.TodoItem]       = data => `<Item>\n\t<Todo ${data.checked ? "" : " done"} />\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	cmapReact_js[typeEnum.AnyList]        = data => `<List${data.tag === "ul" ? "" : " ordered"}>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</List>`
	// cmapReact_js[typeEnum.Image]       = data => `<Figure>\n\t<Image src="${data.src}"${!data.alt ? "" : ` alt="${escape(data.alt)}"`} />${!data.alt ? "" : `\n\t<Caption>\n\t\t${toInnerString(data.children, cmapReact_js)}\n\t</Caption>`}\n</Figure>`
	cmapReact_js[typeEnum.Break]          = data => "<Break />"
	/* eslint-enable no-multi-spaces */
})()

export function toInnerText(children) {
	return toInnerString(children)
}
export function toText(reactVDOM) {
	return toString(reactVDOM)
}
export function toHTML(reactVDOM) {
	return toString(reactVDOM, cmapHTML)
}
export function toHTML__BEM(reactVDOM) {
	return toString(reactVDOM, cmapHTML__BEM)
}
export function toReact_js(reactVDOM) {
	return toString(reactVDOM, cmapReact_js)
}
