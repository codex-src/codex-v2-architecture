import TypeEnum from "./TypeEnum"

import {
	Header,
	Paragraph,
} from "./Elements"

const TypeMap = {
	[TypeEnum.Header]: Header,
	[TypeEnum.Paragraph]: Paragraph,
}

export default TypeMap
