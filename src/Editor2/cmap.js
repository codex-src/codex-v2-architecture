import escape from "lodash/escape"
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

;(() => {
	/* eslint-disable no-multi-spaces */
	cmapText[typeEnum.Escape]              = data => data.children
	cmapText[typeEnum.Emoji]               = data => toInnerString(data.children)
	cmapText[typeEnum.Emphasis]            = data => toInnerString(data.children)
	cmapText[typeEnum.Strong]              = data => toInnerString(data.children)
	cmapText[typeEnum.StrongEmphasis]      = data => toInnerString(data.children)
	cmapText[typeEnum.Code]                = data => data.children
	cmapText[typeEnum.Strike]              = data => toInnerString(data.children)
	// cmapText[typeEnum.A]                = data => toInnerString(data.children)
	cmapText[typeEnum.Header]              = data => toInnerString(data.children)
	cmapText[typeEnum.Paragraph]           = data => toInnerString(data.children)
	cmapText[typeEnum.BlockquoteItem]      = data => toInnerString(data.children)
	cmapText[typeEnum.Blockquote]          = data => toString(data.children)
	// cmapText[typeEnum.CodeBlock]        = data => data.children.slice(0, -1)
	// cmapText[typeEnum.ListItem]         = data => toInnerString(data.children)
	// cmapText[typeEnum.TodoItem]         = data => toInnerString(data.children)
	// cmapText[typeEnum.List]             = data => toString(data.children)
	// cmapText[typeEnum.Image]            = data => toInnerString(data.children)
	cmapText[typeEnum.Break]               = data => ""

	cmapHTML[typeEnum.Escape]              = data => data.children
	cmapHTML[typeEnum.Emoji]               = data => `<span aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML)}</span>`
	cmapHTML[typeEnum.Emphasis]            = data => `<em>${toInnerString(data.children, cmapHTML)}</em>`
	cmapHTML[typeEnum.Strong]              = data => `<strong>${toInnerString(data.children, cmapHTML)}</strong>`
	cmapHTML[typeEnum.StrongEmphasis]      = data => `<strong><em>${toInnerString(data.children, cmapHTML)}</em></strong>`
	cmapHTML[typeEnum.Code]                = data => `<code>${toInnerString(data.children, cmapHTML)}</code>`
	cmapHTML[typeEnum.Strike]              = data => `<strike>${toInnerString(data.children, cmapHTML)}</strike>`
	// cmapHTML[typeEnum.A]                = data => `<a href="${data.href}">${toInnerString(data.children, cmapHTML)}</a>`
	cmapHTML[typeEnum.Header]              = data => `<a href="#${data.hash}">\n\t<${data.tag} id="${data.hash}">\n\t\t${toInnerString(data.children, cmapHTML)}\n\t</${data.tag}>\n</a>`
	cmapHTML[typeEnum.Paragraph]           = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[typeEnum.BlockquoteItem]      = data => `<p>\n\t${toInnerString(data.children, cmapHTML)}\n</p>`
	cmapHTML[typeEnum.Blockquote]          = data => `<blockquote>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	// cmapHTML[typeEnum.CodeBlock]        = data => `<pre${!data.extension ? "" : ` class="language-${(data.extension).toLowerCase()}"`}><code><!--\n-->${toInnerString(data.children, cmapHTML).slice(0, -1)}<!--\n--></code></pre>`
	// cmapHTML[typeEnum.ListItem]         = data => `<li>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	// cmapHTML[typeEnum.TodoItem]         = data => `<li>\n\t<input type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML)}\n</li>`
	// cmapHTML[typeEnum.List]             = data => `<${data.tag}>${`\n${toString(data.children, cmapHTML).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	// cmapHTML[typeEnum.Image]            = data => `<figure>\n\t<img src="${data.src}"${!data.alt ? "" : ` alt="${escape(data.alt)}"`}>${!data.alt ? "" : `\n\t<figcaption>\n\t\t${toInnerString(data.children, cmapHTML)}\n\t</figcaption>`}\n</figure>`
	cmapHTML[typeEnum.Break]               = data => "<hr>"

	// TODO: Rename blockquote__p to blockquote__item?
	cmapHTML__BEM[typeEnum.Escape]         = data => data.children
	cmapHTML__BEM[typeEnum.Emoji]          = data => `<span class="emoji" aria-label="${data.description}" role="img">${toInnerString(data.children, cmapHTML__BEM)}</span>`
	cmapHTML__BEM[typeEnum.Emphasis]       = data => `<em class="em">${toInnerString(data.children, cmapHTML__BEM)}</em>`
	cmapHTML__BEM[typeEnum.Strong]         = data => `<strong class="strong">${toInnerString(data.children, cmapHTML__BEM)}</strong>`
	cmapHTML__BEM[typeEnum.StrongEmphasis] = data => `<strong class="strong"><em class="em">${toInnerString(data.children, cmapHTML__BEM)}</em></strong>`
	cmapHTML__BEM[typeEnum.Code]           = data => `<code class="code">${toInnerString(data.children, cmapHTML__BEM)}</code>`
	cmapHTML__BEM[typeEnum.Strike]         = data => `<strike class="strike">${toInnerString(data.children, cmapHTML__BEM)}</strike>`
	// cmapHTML__BEM[typeEnum.A]           = data => `<a class="a" href="${data.href}" target="_blank">${toInnerString(data.children, cmapHTML__BEM)}</a>`
	cmapHTML__BEM[typeEnum.Header]         = data => `<a class="a" href="#${data.hash}">\n\t<${data.tag} id="${data.hash}" class="${data.tag}">\n\t\t${toInnerString(data.children, cmapHTML__BEM)}\n\t</${data.tag}>\n</a>`
	cmapHTML__BEM[typeEnum.Paragraph]      = data => `<p class="p${!data.emojis ? "" : ` emojis--${data.children.length}`}">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</p>`
	cmapHTML__BEM[typeEnum.BlockquoteItem] = data => `<p class="blockquote__p">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</p>`
	cmapHTML__BEM[typeEnum.Blockquote]     = data => `<blockquote class="blockquote">${`\n${toString(data.children, cmapHTML__BEM).split("\n").map(each => `\t${each}`).join("\n")}\n`}</blockquote>`
	// cmapHTML__BEM[typeEnum.CodeBlock]   = data => `<pre class="pre"${!data.extension ? "" : ` class="language-${(data.extension).toLowerCase()}"`}><code class="pre__code"><!--\n-->${toInnerString(data.children, cmapHTML__BEM).slice(0, -1)}<!--\n--></code></pre>`
	// cmapHTML__BEM[typeEnum.ListItem]    = data => `<li class="${data.tag}__li">\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</li>`
	// cmapHTML__BEM[typeEnum.TodoItem]    = data => `<li class="${data.tag}__li">\n\t<input class="${data.tag}__li__input--${!data.checked.value ? "unchecked" : "checked"}" type="checkbox"${!data.checked.value ? "" : " checked"}>\n\t${toInnerString(data.children, cmapHTML__BEM)}\n</li>`
	// cmapHTML__BEM[typeEnum.List]        = data => `<${data.tag} class="${data.tag}">${`\n${toString(data.children, cmapHTML__BEM).split("\n").map(each => `\t${each}`).join("\n")}\n`}</${data.tag}>`
	// cmapHTML__BEM[typeEnum.Image]       = data => `<figure class="figure">\n\t<img class="figure__img" src="${data.src}"${!data.alt ? "" : ` alt="${escape(data.alt)}"`}>${!data.alt ? "" : `\n\t<figcaption class="figure__figcaption">\n\t\t${toInnerString(data.children, cmapHTML__BEM)}\n\t</figcaption>`}\n</figure>`
	cmapHTML__BEM[typeEnum.Break]          = data => "<hr class=\"hr\">"

	cmapReact_js[typeEnum.Escape]          = data => data.children
	cmapReact_js[typeEnum.Emoji]           = data => `<E>${toInnerString(data.children, cmapReact_js)}</E>`
	cmapReact_js[typeEnum.Emphasis]        = data => `<Em>${toInnerString(data.children, cmapReact_js)}</Em>`
	cmapReact_js[typeEnum.Strong]          = data => `<Strong>${toInnerString(data.children, cmapReact_js)}</Strong>`
	cmapReact_js[typeEnum.StrongEmphasis]  = data => `<StrongEm>${toInnerString(data.children, cmapReact_js)}</StrongEm>`
	cmapReact_js[typeEnum.Code]            = data => `<Code>${toInnerString(data.children, cmapReact_js)}</Code>`
	cmapReact_js[typeEnum.Strike]          = data => `<Strike>${toInnerString(data.children, cmapReact_js)}</Strike>`
	// cmapReact_js[typeEnum.A]            = data => `<A href="${data.href}">${toInnerString(data.children, cmapReact_js)}</A>`
	cmapReact_js[typeEnum.Header]          = data => `<a href="#${data.hash}">\n\t<${data.tag.toUpperCase()} id="${data.hash}">\n\t\t${toInnerString(data.children, cmapReact_js)}\n\t</${data.tag.toUpperCase()}>\n</a>`
	cmapReact_js[typeEnum.Paragraph]       = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[typeEnum.BlockquoteItem]  = data => `<P>\n\t${toInnerString(data.children, cmapReact_js)}\n</P>`
	cmapReact_js[typeEnum.Blockquote]      = data => `<Blockquote>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</Blockquote>`
	// cmapReact_js[typeEnum.CodeBlock]    = data => `<Pre${!data.extension ? "" : ` info="${(data.extension).toLowerCase()}"`}>\n{\`${toInnerString(data.children.slice(0, -1)).replace(/`/g, "\\`")}\`}\n</Pre>`
	// cmapReact_js[typeEnum.ListItem]     = data => `<Item>\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	// cmapReact_js[typeEnum.TodoItem]     = data => `<Item>\n\t<Todo${!data.checked.value ? "" : " done"} />\n\t${toInnerString(data.children, cmapReact_js)}\n</Item>`
	// cmapReact_js[typeEnum.List]         = data => `<List${data.tag === "ul" ? "" : " ordered"}>${`\n${toString(data.children, cmapReact_js).split("\n").map(each => `\t${each}`).join("\n")}\n`}</List>`
	// cmapReact_js[typeEnum.Image]        = data => `<Figure>\n\t<Image src="${data.src}"${!data.alt ? "" : ` alt="${escape(data.alt)}"`} />${!data.alt ? "" : `\n\t<Caption>\n\t\t${toInnerString(data.children, cmapReact_js)}\n\t</Caption>`}\n</Figure>`
	cmapReact_js[typeEnum.Break]           = data => "<Break />"
	//	/* eslint-enable no-multi-spaces */
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