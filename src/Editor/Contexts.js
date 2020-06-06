import React from "react"
export const ReadOnlyContext = React.createContext()
// export const DispatchContext = React.createContext()

export function useReadOnlyContext() {
	return React.useContext(ReadOnlyContext)
}
