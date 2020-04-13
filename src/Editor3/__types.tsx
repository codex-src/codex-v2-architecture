/* eslint-disable no-multi-spaces */
import React from "react"

// Describes a fragment of a cursor data structure.
export type PosFragment = {
	id:     string, // Node or root UUID
	offset: number, // Offset to the cursor from the node or root
}

// Describes a cursor data structure.
export type Pos = {
	node: PosFragment,
	root: PosFragment,
}

// Describes an unparsed element.
export type UnparsedElement = {
	id:  string, // The UUID
	raw: string, // The raw-text
}

// TODO: ParsedElement

// Describes an editor state.
export type EditorState = {
	readOnly:    boolean,           // Is the editor read-only?
	focused:     boolean,           // Is the editor focused?
	data:        UnparsedElement[], // The document data
	pos1:        Pos,               // The start cursor
	pos2:        Pos,               // The end cursor
	extPosRange: string[],          // The extended cursor range (root ID)
	reactDOM:    HTMLDivElement,    // The React-managed DOM -- obscured from the user
}

export type EditorSetStateAction = React.Dispatch<React.SetStateAction<EditorState>>

export type EditorSetState = [EditorState, EditorSetStateAction]

export type EditorProps = {
	state:    EditorState,
	setState: EditorSetStateAction,
	// TODO: Etc.
}
