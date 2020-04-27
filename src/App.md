# Steps to build a WYSIWYG editor

- [ ] Select-all-delete seems like it’s broken in Firefox
- [ ] Add option to selectively tint markdown elements
	- [ ] This doesn’t have to be complicated; can use a feature class to opt-in
		- [ ] `feature-markdown-bg`
			- [ ] Still, would this be preferable as a plugin because it’s not core behavior?
- [ ] Add custom `onKeyDown` handler for `isMetaOrCtrlKey` with an
	- [ ] What we really probably want is synthetic left and right arrow events; elements `inline-block` interact with the keyboard in awkward ways. Technically we can skip `word` but we minus well extract the logic from the backspace events and generalize boundary iteration.
- [x] Rename `<CodeBlock>` to `<Preformatted>`
- [x] Change parser to handle punctuation as a pedantic case
	- [x] Breaks examples like `_very steep bet_.` where the punctuation is not _a part_ of the word
- [x] Lists
	- [x] Unordered
	- [ ] Ordered
	- [ ] Checklists
- [ ] Image
	- [ ] Support inline images?
		- [ ] Technically it shouldn’t be _that_ much harder. If an image is _standalone_ (only inside of a `<Paragraph>`?) then we can render it full-width.
	- [ ] Linked images _should_ work, even if they’re standalone. This reinforces the need for inline images and some heuristic to see if it’s standalone.
- [ ] Add computed width and height to editor state -- needed resolving image proportions / aspect ratio
- [x] Link
	- [x] `[_anchor_](href)` is not italicizing
	- [x] Naked link
		- [x] `https://`
		- [x] `http://`
	- [ ] Naked images?
	- [ ] Naked embeds?
		- [ ] Notion actually uses image syntax for embeds IIRC
			- [ ] This somehow seems preferable?
			- [ ] Notion uses syntax links: `[Untitled](https://www.notion.so/dc4893e0e4344b679c119519aa7ef059)` to represent arbitrary data
	- [x] GFM link
- [ ] Scroll into view
	- [ ] Technically all handlers should scroll into view because an editor may have a header and or footer it needs to consider
	- [ ] Affects _all_ `keyDown` and `onInput` events? This is a different methodology than throwing it in `useLayoutEffect` because that version is _too greedy_.
	- [ ] **Does not** just apply to `keyDown` because of viewport parameters, but can start with just `onKeyDown` events
- [ ] Copy event listeners https://blog.sivavaka.com/2010/11/javascript-clonenode-doesnt-copy-event.html
		- [ ] This is _quite_ necessary for adding click handlers to todo items
- [x] Syntax highlighting bug `fmt.Println(")"`
	- [x] Not really reproducible?
- [ ] Shortcuts for naive formatting https://slack.com/intl/en-kr/help/articles/201374536-slack-keyboard-shortcuts
- [x] Animated modal alert for read-only mode, etc.
	- [x] Add some kind of icon or lock icon
- [ ] Test…

Paid features
	- HTML export
	- Unlimited notes
	- Gist-syncing
	- Image uploading
	- Automatic backups (per 100 edits, for example)
	- Attached profile (social links, etc.?)
	- Analytics
	- Social?
	- COURSES
	- COURSE DISCOUNTS
		- Usually $29/once
		- $19/once with membership
		- Membership is $5/mo

# Course ideas

So let’s imagine courses are like $19/each but with a subscription come down to $9

## Go
## Advanced Go
## Go Concurrency
## SQLite
## Postgres
## GraphQL `graph-gophers`
## JavaScript / ES6
## React
## React courses
## Markdown parser
## Syntax highlighting (JS)
## Tailwind CSS
## Tailwind React
## Tailwind animations
## Regex
## Applets?
