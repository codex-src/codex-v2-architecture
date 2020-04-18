import typeEnum from "./typeEnum"

import {
	Blockquote,
	BlockquoteItem,
	Break,
	Header,
	Paragraph,
} from "./Elements"

import {
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
	[typeEnum.Header]: Header,
	[typeEnum.Paragraph]: Paragraph,
	[typeEnum.BlockquoteItem]: BlockquoteItem,
	[typeEnum.Blockquote]: Blockquote,
	[typeEnum.Break]: Break,

	// Inline elements:
	[typeEnum.Escape]: Escape,
	[typeEnum.Emoji]: Emoji,
	[typeEnum.Emphasis]: Emphasis,
	[typeEnum.Strong]: Strong,
	[typeEnum.StrongEmphasis]: StrongEmphasis,
	[typeEnum.Code]: Code,
	[typeEnum.Strikethrough]: Strikethrough,
}

export default typeEnumMap
