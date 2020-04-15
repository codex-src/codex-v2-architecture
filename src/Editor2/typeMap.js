import typeEnum from "./typeEnum"

import {
	Header,
	P,
} from "./Elements"

import {
	Emphasis,
	Strong,
	StrongEmphasis,
} from "./InlineElements"

const typeMap = {
	// Elements:
	[typeEnum.Header]: Header,
	[typeEnum.P]: P,

	// Inline elements:
	[typeEnum.Emphasis]: Emphasis,
	[typeEnum.Strong]: Strong,
	[typeEnum.StrongEmphasis]: StrongEmphasis,
}

export default typeMap
