import ReactDOM from "react-dom"

// Renders a React component to a DOM node.
//
// TODO: Add support for document fragments
function renderDOM(Component) {
	const domNode = document.createElement("div")
	ReactDOM.render(Component, domNode)
	return domNode.childNodes[0]
}

export default renderDOM
