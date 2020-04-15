import ElementsEnum from "./ElementsEnum"

import {
	Header,
	Paragraph,
} from "./Elements"

// import {
// 	Emphasis,
// 	Strong,
// 	StrongEmphasis,
// } from "./InlineElements"

const TypeMap = {
	// Elements:
	[ElementsEnum.Header]: Header,
	[ElementsEnum.Paragraph]: Paragraph,

	// // Inline elements:
	// [ElementsEnum.Emphasis]: Emphasis,
	// [ElementsEnum.Strong]: Strong,
	// [ElementsEnum.StrongEmphasis]: StrongEmphasis,
}

export default TypeMap
