import typeEnum from "./typeEnum"

import {
	Header,
	P,
} from "./Elements"

const typeMap = {
	[typeEnum.Header]: Header,
	[typeEnum.P]: P,
}

export default typeMap
