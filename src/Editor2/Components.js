import React from "react"

import {
	Multiline,
	Paragraph,
} from "./HOC"

export const P = ({ id, data }) => (
	<Paragraph id={id}>
		{data}
	</Paragraph>
)
