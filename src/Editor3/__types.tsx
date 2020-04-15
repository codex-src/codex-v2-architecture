/* eslint-disable no-multi-spaces */
import ElementsEnum from "./ElementsEnum"
import InlineElementsEnum from "./InlineElementsEnum"
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

export type Syntax = string | string[]

/*
 * Elements
 */

export type ParagraphElement = {
	type:   ElementsEnum, // Do not use type?: ElementsEnum
	id:     string,

	raw:    string,
  parsed: string, // TODO
}

export type HeaderElement = {
	type:   ElementsEnum, // Do not use type?: ElementsEnum
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
	type:     InlineElementsEnum,
	syntax:   Syntax,
	raw:      string,
	children: ParsedInlineElement, // TODO: Rename to parsed?
}

export type StrongElement = {
	type:     InlineElementsEnum,
	syntax:   Syntax,
	raw:      string,
	children: ParsedInlineElement, // TODO: Rename to parsed?
}

export type StrongEmphasisElement = {
	type:     InlineElementsEnum,
	syntax:   Syntax,
	raw:      string,
	children: ParsedInlineElement, // TODO: Rename to parsed?
}

export type ParsedInlineElement =
	null |
	string |
	EmphasisElement |
	StrongElement |
	StrongEmphasisElement





// Describes contract for a parsed element.
export interface IParsedElement {
	id:     string,
	raw:    string,
	parsed: NestedElement,
}

// Describes contract for a parsed inline element.
export interface IParsedInlineElement {
	raw:    string,
	parsed: NestedElement,
}

// Describes all elements.
export type ParsedElement2 =
	ParagraphElement2

// Describes all nestable elements.
export type NestedElement =
	null |
	string |
	ParsedElement2 |
	ParsedElement2[] |
	ParsedInlineElement2 |
	ParsedInlineElement2[]

export type ParagraphElement2 = {
	id:     string,
	raw:    string,
	parsed: NestedElement,
}

// Describes all inline elements.
export type ParsedInlineElement2 =
	EmphasisElement2 |
	StrongElement2

// Describes all nestable inline elements.
export type NestedInlineElement =
	null |
	string |
	ParsedInlineElement2 |
	ParsedInlineElement2[]

export type EmphasisElement2 = {
	raw:    string,
	parsed: NestedInlineElement,
}

export type StrongElement2 = {
	raw:    string,
	parsed: NestedInlineElement,
}
