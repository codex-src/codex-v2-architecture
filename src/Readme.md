## Readme

> 👋 This is an _interactive_ readme; type to make changes!

**Codex is a markdown editor for devs.** Codex is based on GitHub Flavored Markdown, meaning you can format notes using special _syntax_ characters. This also means when you copy text, you _never_ loose formatting. ✨

**Your note is saved to localStorage.** This means when you refresh the page, your changes persist. Soon, Codex will be developed into web app that syncs to the cloud. ☁️ _Note that changes to the interactive editor are not saved._

### Inline elements

- _Italics_ or *italics*
- **Bold**
- ***Bold and italics***
- `Code` or ~code~
- ~~Strikethrough~~
- [Link](https://google.com)
- https://google.com

### Blockquotes

> **Yoda: No! No different! Only different in your mind. You must _unlearn_ what you have learned.**
>
> _Luke: All right, I'll give it a try._
>
> **Yoda: No! Try not. Do. Or do not. There is no try.**

### Code blocks

```main.go
package main

import "fmt"

func main() {
	fmt.Println("Hello, world!")
}
```

Syntax highlighting is supported for the following languages. You can use a filename like `main.go`, or an extension, like `go`:

```
bash c cpp css d diff docker dockerfile git go graphql htm html http js json jsx kotlin php py rb ruby rust sass sh sql svg swift ts tsx wasm xml yaml yml
```

### Lists

Use `- ` or `* ` for unordered lists:

- This is an unordered list item
- This is _another_ unordered list item
- This is yet _another_ unordered list item

You can also use `1. ` (or any number) for ordered lists:

1. This is an ordered list
1. This is _another_ ordered list item
1. This is yet _another_ ordered list item

You can also use `- [ ] ` and `- [x] ` for todo items:

- [ ] This is a todo item
- [ ] This is _another_ todo item
- [ ] This is yet _another_ todo list item

(Psst…try clicking me!)

When you press `enter` inside of a list, a new list item will be created for you. You can also use `tab` and `shift-tab` to tab and detab list items.

### Section breaks

Use `---` or `***` to create section breaks:

---

***
