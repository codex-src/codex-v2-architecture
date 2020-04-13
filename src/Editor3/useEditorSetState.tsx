import * as Types from "./__types"
import EditorContext from "./EditorContext"
import React from "react"

export default () => React.useContext<null | Types.EditorSetState>(EditorContext)
