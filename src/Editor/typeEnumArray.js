import {
	AnyList,
	AnyListItem,
	Blockquote,
	BlockquoteItem,
	Break,
	Header,
	Paragraph,
	Preformatted,
	TodoItem,
} from "./Elements"

import {
	Anchor,
	Code,
	Emoji,
	Emphasis,
	Escape,
	Strikethrough,
	Strong,
	StrongEmphasis,
} from "./InlineElements"

const typeEnumArray = [
	// Elements:
	AnyList,        // "AnyList",
	AnyListItem,    // "AnyListItem",
	Blockquote,     // "Blockquote",
	BlockquoteItem, // "BlockquoteItem",
	Break,          // "Break",
	Header,         // "Header",
	Paragraph,      // "Paragraph",
	Preformatted,   // "Preformatted",
	TodoItem,       // "TodoItem",

	// Inline elements:
	Anchor,         // "Anchor",
	Code,           // "Code",
	Emoji,          // "Emoji",
	Emphasis,       // "Emphasis",
	Escape,         // "Escape",
	Strikethrough,  // "Strikethrough",
	Strong,         // "Strong",
	StrongEmphasis, // "StrongEmphasis",
]

export default typeEnumArray
