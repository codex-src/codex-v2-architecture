import TypeEnum from "./TypeEnum"

import {
	Header,
	P,
} from "./Elements"

const TypeMap = {
	[TypeEnum.Header]: Header,
	[TypeEnum.P]: P,
}

export default TypeMap
