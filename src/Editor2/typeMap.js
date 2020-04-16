import typeEnum from "./typeEnum"

import {
	Header,
	Paragraph,
} from "./Elements"

import {
	Code,
	Emoji,
	Emphasis,
	Strikethrough,
	Strong,
	StrongEmphasis,
} from "./InlineElements"

const typeMap = {
	// Elements:
	[typeEnum.Header]: Header,
	[typeEnum.Paragraph]: Paragraph,

	// Inline elements:
	[typeEnum.Emoji]: Emoji,
	[typeEnum.Emphasis]: Emphasis,
	[typeEnum.Strong]: Strong,
	[typeEnum.StrongEmphasis]: StrongEmphasis,
	[typeEnum.Code]: Code,
	[typeEnum.Strikethrough]: Strikethrough,
}

export default typeMap
