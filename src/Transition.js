import React from "react"
import { CSSTransition } from "react-transition-group"

// https://github.com/adamwathan/tailwind-ui-navbar-react/blob/1bbfde78deb96befc371d8726e41a32bdd66403d/pages/index.js#L4
function Transition({
	unmountOnExit, //
	show,          // *Required
	enter,         // *Required
	enterFrom,     // *Required
	enterTo,       // *Required
	enterActive,   //
	leave,         // *Required
	leaveFrom,     // *Required
	leaveTo,       // *Required
	leaveActive,   //
	children,      // *Required
}) {
	// // Adds many classes to a node.
	// const add = (node, ...classes) => {
	// 	for (const className of classes) {
	// 		if (!className) {
	// 			// No-op
	// 			continue
	// 		}
	// 		node.classList.add(...className.split(/\s+/))
	// 	}
	// }
	// // Removes many classes from a node.
	// const remove = (node, classes) => {
	// 	for (const className of classes) {
	// 		if (!className) {
	// 			// No-op
	// 			continue
	// 		}
	// 		node.classList.remove(...className.split(/\s+/))
	// 	}
	// }

	const enterClasses = enter.split(/\s+/)
	const enterFromClasses = enterFrom.split(/\s+/)
	const enterToClasses = enterTo.split(/\s+/)
	const leaveClasses = leave.split(/\s+/)
	const leaveFromClasses = leaveFrom.split(/\s+/)
	const leaveToClasses = leaveTo.split(/\s+/)

	return (
		<CSSTransition
			unmountOnExit={unmountOnExit === undefined ? true : unmountOnExit}
			in={show}
			addEndListener={(node, done) => {
				node.addEventListener("transitionend", done, false)
			}}
			onEnter={node => {
				// Experimental API:
				if (!unmountOnExit) {
					node.classList.remove(...leaveToClasses)
				}
				node.classList.add(...enterClasses, ...enterFromClasses)
			}}
			onEntering={node => {
				node.classList.remove(...enterFromClasses)
				node.classList.add(...enterToClasses)
			}}
			onEntered={node => {
				// Experimental API:
				if (unmountOnExit) {
					node.classList.remove(...enterToClasses)
				}
				node.classList.remove(...enterClasses)
			}}
			onExit={node => {
				// Experimental API:
				if (!unmountOnExit) {
					node.classList.remove(...enterToClasses)
				}
				node.classList.add(...leaveClasses, ...leaveFromClasses)
			}}
			onExiting={node => {
				node.classList.remove(...leaveFromClasses)
				node.classList.add(...leaveToClasses)
			}}
			onExited={node => {
				// Experimental API:
				if (unmountOnExit) {
					node.classList.remove(...leaveToClasses)
				}
				node.classList.remove(...leaveClasses)
			}}
		>
			{children}
		</CSSTransition>
	)
}

export default Transition
