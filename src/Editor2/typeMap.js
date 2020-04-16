import typeEnum from "./typeEnum"

import {
	Header,
	Paragraph,
} from "./Elements"

import {
	Code,
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
	[typeEnum.Emphasis]: Emphasis,
	[typeEnum.Strong]: Strong,
	[typeEnum.StrongEmphasis]: StrongEmphasis,
	[typeEnum.Code]: Code,
	[typeEnum.Strikethrough]: Strikethrough,
}

export default typeMap
