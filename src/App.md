# Hello, Codex!

_What am I looking at?_

This is a technical prototype for the new editor architecture for https://opencodex.dev. **The left-hand side is a `<textarea>` you can type into and the right-hand side renders React! 👀** This prototype specifically parses GitHub Flavored Markdown into _multiple_ data types, including `text`, `html`, and `json`. 🤓

Try pressing the `Plain text`, `Markdown`, `HTML` and `JSON` buttons at the top; these convert the parsed markdown data structure to various formats. This may help you better understand what’s going on behind the hood.

**Syntax highlighting** is supported thanks to PrismJS. Simply open a code block and type!

```go
package main

import "fmt"

func main() {
	fmt.Println("hello, world!")
}
```

All of the following language extensions are supported right now:

```
bash c cpp css d diff docker dockerfile git go graphql html http js jsx json kotlin php py rb ruby rust sass sh sql svg swift ts tsx wasm xml yaml yml
```

Furthermore, this demo supports the following block-level elements:

> _To be, or not to be, that is the question:_
> _Whether 'tis nobler in the mind to suffer_
> _The slings and arrows of outrageous fortune,_
> _Or to take arms against a sea of troubles_
> _And by opposing end them._
>
> — William Shakespeare

OK so blockquotes, obviously. 😉

- Lists
	- Nested lists
		- Recursively nested lists
			- You get the idea…

1. Numbered lists are also supported
1. You don’t need to bother typing the _actual_ list item number, in read-only mode all of this is handled _for you_
1. Nested lists also reset the number counter ask you would imagine
	1. So this would be render `1.`
		1. And this would _also_ render `1.`
	1. But this would render `2.` (in read-only mode)

And finally…

🥁

No…not emojis, _though those are supported._

- [x] **Checklists!**
- [x] Or as GFM would have you refer to them…task lists
- [ ] Checklists can be ‘checked’ or ‘unchecked’ simply by using GFM-flavored syntax: use `- [ ]` for unchecked and `- [x]` for checked
	- [ ] Task lists are normal lists, so you can easily nest them
		- [ ] Recursively!
			- [ ] OK…I think you get the idea 😉

Last and not least…images _(and GIFs)_ are supported!

![You call that code?! Khhheee!! 😾](https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif)
