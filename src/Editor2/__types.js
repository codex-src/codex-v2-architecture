export type PosType = {
	root: {
		id: string,
		offset: number,
	},
	node: {
		id: string,
		offset: number,
	}
}

type UnparsedElement = {
	id: string,
	raw: string,
}

export type UnparsedElements = Array<UnparsedElement>

export type EditorState = {
	readOnly: boolean,
	focused: boolean,
	data: any, // TODO
	pos1: PosType,
	pos2: PosType,
	extPosRange: Array<string>,
	reactDOM: HTMLElement,
}
