## Readme

> 👋 This is an _interactive_ readme; type to make changes!

**Codex is a new WYSIWYG markdown editor _for_ developers.** Codex is based on GFM, that is, [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown) meaning your can format words using special syntax characters. This _also_ means you can copy notes in and out of the Codex editor and never loose formatting. ✨

As you type, your note is saved to localStorage. This means you can refresh the page and your changes will persist. Note that this _doesn’t_ apply to the interactive readme.

## Inline elements:

### _Italics_ and **bold**

You can format your note using the following syntax characters: `_` or `*` for _italics_ or *italics*, `**` for **bold** and `***` for ***bold and italics***.

### `Code`, ~~strikethrough~~, and [links](https://google.com)

You can use ~`~ or `~` for `code` or ~code~, `~~` for ~~strikethrough~~, and `[link](url)` for [links](https://google.com). You can also use `https://` to delimit a naked link. For example: https://google.com.

## Block elements:

You can use any of the following to create a **header**:

- `# ` for an H1 header
- `## ` for an H2 header
- `### ` for an H3 header
- `#### ` H4
- `##### ` H5
- `###### ` H6

You can use `> ` to create a blockquote. Blockquotes can also be multiline — use `>` (without a space) for empty lines.

For example:

> This is what a blockquote looks like.

You can use ~```~ for code blocks. To add syntax highlighting, simply add a filename or the extension of the language you want to highlight. _Most_ languages are supported.

For example:

```main.go
package main

import "fmt"

func main() {
	fmt.Println("Hello, world!")
}
```

You can add _many_ kinds of lists using the following syntax:

- `- ` for **unordered** lists.
- `1. ` (any number works) for **ordered** lists.
	- Note in preview mode, the correct number is displayed for you.
- `- [ ]` or `- [x]` for unchecked and checked **task items** (e.g. todo lists).

For example:

- [ ] I’m unchecked.
- [x] I’m checked!

You can also arbitrarily nest lists (use `tab` to indent and `shift-tab` to detab).

For example:

**How to build a successful startup: 💡**

- [x] ??!??!?
	- [x] ?!!?
		- [x] !?!?!
	- [x] ?!?!
- [ ] **PROFIT!!**

You can add section breaks (think `<hr>`) using `---` or `***` on their own line:

---
***

Thank you for reading!
