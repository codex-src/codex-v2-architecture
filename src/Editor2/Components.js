import React from "react"

import {
	// Multiline,
	Paragraph,
} from "./HOC"

export const P = ({ id, parsed }) => (
	<Paragraph id={id}>
		{parsed}
	</Paragraph>
)
