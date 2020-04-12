// @flow
import parse from "./parser"
import React from "react"
import uuidv4 from "uuid/v4"
import { newPos } from "./constructors"

type PosType = {|
	root: {|
		id: string,
		offset: number,
	|},
	node: {|
		id: string,
		offset: number,
	|}
|}

type EditorState = {|
	readOnly: boolean,
	focused: boolean,
	data: any, // TODO
	pos1: PosType,
	pos2: PosType,
	extPosRange: Array<string>,
	reactDOM: HTMLElement,
|}

function useEditor(initialValue: string) {
	const unparsed = initialValue.split("\n").map(each => ({
		id: uuidv4(),
		raw: each,
	}))
	const reactDOM = document.createElement("div")
	const [state, setState] = React.useState<EditorState>(() => ({
		readOnly: false,       // Is read-only?
		focused: false,        // Is focused?
		data: parse(unparsed), // Document data
		pos1: newPos(),        // Start cursor data structure
		pos2: newPos(),        // End cursor data structure
		extPosRange: ["", ""], // Extended cursor ID (root ID) range
		reactDOM,              // The React-managed DOM
	}))
	return [state, setState]
}

export default useEditor
