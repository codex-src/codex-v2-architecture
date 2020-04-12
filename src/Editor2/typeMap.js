import typeEnum from "./typeEnum"

import {
	Header,
	P,
} from "./Components"

const typeMap = {
	[typeEnum.Header]: Header,
	[typeEnum.P]: P,
}

export default typeMap
