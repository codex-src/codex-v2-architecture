import typeEnum from "./typeEnum"

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

const typeEnumMap = {
	// Elements:
	[typeEnum.AnyList]: AnyList,
	[typeEnum.AnyListItem]: AnyListItem,
	[typeEnum.Blockquote]: Blockquote,
	[typeEnum.BlockquoteItem]: BlockquoteItem,
	[typeEnum.Break]: Break,
	[typeEnum.Header]: Header,
	[typeEnum.Paragraph]: Paragraph,
	[typeEnum.Preformatted]: Preformatted,
	[typeEnum.TodoItem]: TodoItem,

	// Inline elements:
	[typeEnum.Anchor]: Anchor,
	[typeEnum.Code]: Code,
	[typeEnum.Emoji]: Emoji,
	[typeEnum.Emphasis]: Emphasis,
	[typeEnum.Escape]: Escape,
	[typeEnum.Strikethrough]: Strikethrough,
	[typeEnum.Strong]: Strong,
	[typeEnum.StrongEmphasis]: StrongEmphasis,
}

export default typeEnumMap
