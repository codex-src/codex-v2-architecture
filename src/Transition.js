import React from "react"
import { CSSTransition } from "react-transition-group"

// https://github.com/adamwathan/tailwind-ui-navbar-react/blob/1bbfde78deb96befc371d8726e41a32bdd66403d/pages/index.js#L4
function Transition({ show, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo, children }) {
	const enterClasses = enter.split(" ")
	const enterFromClasses = enterFrom.split(" ")
	const enterToClasses = enterTo.split(" ")
	const leaveClasses = leave.split(" ")
	const leaveFromClasses = leaveFrom.split(" ")
	const leaveToClasses = leaveTo.split(" ")

	return (
		<CSSTransition
			unmountOnExit
			in={Boolean(show)}
			addEndListener={(node, done) => {
				node.addEventListener("transitionend", done, false)
			}}
			onEnter={node => {
				node.classList.add(...enterClasses, ...enterFromClasses)
			}}
			onEntering={node => {
				node.classList.remove(...enterFromClasses)
				node.classList.add(...enterToClasses)
			}}
			onEntered={node => {
				node.classList.remove(...enterToClasses, ...enterClasses)
			}}
			onExit={node => {
				node.classList.add(...leaveClasses, ...leaveFromClasses)
			}}
			onExiting={node => {
				node.classList.remove(...leaveFromClasses)
				node.classList.add(...leaveToClasses)
			}}
			onExited={node => {
				node.classList.remove(...leaveToClasses, ...leaveClasses)
			}}
		>
			{children}
		</CSSTransition>
	)
}

export default Transition
