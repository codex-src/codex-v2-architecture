import React from "react"

const TransitionV2 = ({
	on,
	transition,
	from,
	to,
	children,
}) => {
	const ref = React.useRef()

	const transitionClasses = (transition || "").split(/\s+/)
	const fromClasses = from.split(/\s+/)
	const toClasses = to.split(/\s+/)

	const mounted = React.useRef()
	React.useLayoutEffect(() => {
		const actualRef = children.ref || ref
		if (!mounted.current && transitionClasses.length && transitionClasses[0]) { // Guards "".split(/\s+/) -> [""]
			actualRef.current.classList.add(...transitionClasses)
		}
		if (!on) {
			actualRef.current.classList.remove(...toClasses)
			actualRef.current.classList.add(...fromClasses)
		} else {
			actualRef.current.classList.remove(...fromClasses)
			actualRef.current.classList.add(...toClasses)
		}
	}, [
		on,
		children.ref,
		ref,
		transitionClasses,
		fromClasses,
		toClasses,
	])

	return !children.ref ? React.cloneElement(children, { ref }) : children
}

export default TransitionV2
