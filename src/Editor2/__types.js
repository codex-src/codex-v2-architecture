// // Describes a cursor data structure.
// export type Pos = {
// 	root: {
// 		id: string,
// 		offset: number,
// 	},
// 	node: {
// 		id: string,
// 		offset: number,
// 	}
// }
//
// // Describes an unparsed element.
// type UnparsedElement = {
// 	id: string,
// 	raw: string,
// }
//
// // Describes an array of unparsed elements.
// export type UnparsedElements = Array<UnparsedElement>
//
// // Describes an editor state.
// export type EditorState = {
// 	readOnly: boolean,
// 	focused: boolean,
// 	data: any, // TODO
// 	pos1: Pos,
// 	pos2: Pos,
// 	extPosRange: Array<string>,
// 	reactDOM: HTMLElement,
// }
