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

// // Describes contract for a parsed element.
// export interface IParsedElement {
// 	id:     string,
// 	raw:    string,
// 	parsed: any, // NestedElement,
// }

// // Describes contract for a parsed inline element.
// export interface IParsedInlineElement {
// 	raw:    string,
// 	parsed: NestedInlineElement,
// }

/*
 * Elements
 */

// Describes all elements.
export type ParsedElement =
	HeaderElement |
	ParagraphElement

// Describes all nestable elements.
export type NestedElement =
	null |
	string // |
	// ParsedElement |
	// ParsedElement[] |
	// ParsedInlineElement |
	// ParsedInlineElement[]

export type HeaderElement = {
	type:   ElementsEnum, // .Header,
	tag:    string,
	id:     string,
	syntax: Syntax,
	hash:   string,
	raw:    string,
	parsed: NestedElement,
}

export type ParagraphElement = {
	type:   ElementsEnum, // .Paragraph,
	id:     string,
	raw:    string,
	parsed: NestedElement,
}

/*
 * Inline elements
 */

// // Describes all inline elements.
// export type ParsedInlineElement =
// 	EmphasisElement |
// 	StrongElement |
// 	StrongEmphasisElement

// Describes all nestable inline elements.
export type NestedInlineElement =
	null |
	string // |
	// ParsedInlineElement |
	// ParsedInlineElement[]

export type EmphasisElement = {
	syntax:   Syntax,
	raw:      string,
	children: NestedInlineElement,
}

export type StrongElement = {
	syntax:   Syntax,
	raw:      string,
	children: NestedInlineElement,
}

export type StrongEmphasisElement = {
	syntax:   Syntax,
	raw:      string,
	children: NestedInlineElement,
}
