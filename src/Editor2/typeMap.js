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

const typeMap = {
	// Elements:
	[typeEnum.Header]: Header,
	[typeEnum.Paragraph]: Paragraph,
	[typeEnum.Blockquote]: Blockquote,
	[typeEnum.BlockquoteItem]: BlockquoteItem,
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

export default typeMap
