/* eslint-disable no-multi-spaces */
import React from "react"
import TypeEnum from "./TypeEnum"

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

// Describes an editor state.
export type EditorState = {
	readOnly:    boolean,         // Is the editor read-only?
	focused:     boolean,         // Is the editor focused?
	data:        ParsedElement[], // The parsed document data
	pos1:        Pos,             // The start cursor
	pos2:        Pos,             // The end cursor
	extPosRange: string[],        // The extended cursor range (root ID)
	reactDOM:    HTMLElement,     // The React-managed DOM -- obscured from the user
}

export type EditorSetStateAction = React.Dispatch<React.SetStateAction<EditorState>>

export type EditorSetState = [EditorState, EditorSetStateAction]

// TODO
export type Syntax = string | string[]

/*
 * Elements
 */

export type ParagraphElement = {
	type:   TypeEnum, // Do not use type?: TypeEnum
	id:     string,

	raw:    string,
  parsed: string, // TODO
}

export type HeaderElement = {
	type:   TypeEnum, // Do not use type?: TypeEnum
	tag:    string,
	id:     string,
	syntax: Syntax,
	hash:   string,
	raw:    string,
  parsed: string, // TODO
}

// Describes a parsed element.
//
// TODO: Rename Components to Elements and InlineElements?
export type ParsedElement =
	HeaderElement |
	ParagraphElement

/*
 * Inline elements
 */
export type EmphasisElement = {
	type:   TypeEnum,
	syntax: Syntax,
	raw:    string,
	parsed: ParsedInlineElement,
}

export type StrongElement = {
	type:   TypeEnum,
	syntax: Syntax,
	raw:    string,
	parsed: ParsedInlineElement,
}

export type StrongEmphasisElement = {
	type:   TypeEnum,
	syntax: Syntax,
	raw:    string,
	parsed: ParsedInlineElement,
}

export type ParsedInlineElement =
	null |
	string |
	EmphasisElement |
	StrongElement |
	StrongEmphasisElement
