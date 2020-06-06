import React from "react"
import Transition from "lib/Transition"

// -----------------
// | 128px -> 8rem |
// -----------------
// TITLE ... # Title
//
function newScrollHandler(e, id, hash) {
	// NOTE: Use e.preventDefault and e.stopPropagation
	// because handlers are nested
	e.preventDefault()
	e.stopPropagation()
	const element = document.getElementById(id)
	if (!element) {
		// No-op
		return
	}
	window.location.hash = hash
	window.scrollTo(0, element.offsetTop)
}

const Outline = React.forwardRef(({
	title,
	toggleOutline,
	children: outline,
}, ref) => {
	const [hoverOutline, setHoverOutline] = React.useState(false)

	return (
		<div ref={ref} className="pb-12 sticky hidden lg:block w-48 overflow-x-hidden" style={{ top: "8rem" }}>

			{/* Title */}
			<button
				// NOTE: Use w-full text-left because of <button>
				className="py-1 flex flex-row items-center w-full text-left text-gray-500 hover:text-blue-500 focus:text-blue-500 truncate focus:outline-none transition duration-150 ease-in-out"
				onPointerEnter={() => setHoverOutline(true)}
				onPointerLeave={() => setHoverOutline(false)}
				onClick={toggleOutline}
			>
				<svg
					className="mr-2 flex-shrink-0 w-4 h-4"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					viewBox="0 0 24 24"
				>
					<Transition
						on={hoverOutline}
						transition="transition duration-150 ease-in-out"
						from="opacity-100 transform translate-x-0"
						to="opacity-0 transform -translate-x-8"
					>
						<path d="M4 6h16M4 12h16M4 18h7" />
					</Transition>
					<Transition
						on={hoverOutline}
						transition="transition duration-150 ease-in-out"
						from="opacity-100 transform translate-x-8"
						to="opacity-100 transform translate-x-0"
					>
						<path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</Transition>
				</svg>
				<p className="font-semibold text-xs tracking-wide uppercase truncate">
					{!hoverOutline ? (
						title.trim() || "Untitled"
					) : (
						"Hide Outline"
					)}
				</p>
			</button>

			{/* Outline */}
			<ul className="mt-2">
				{outline.map(({ id, hash, secondary, children }) => (
					<li key={id} onClick={e => newScrollHandler(e, id, hash)}>
						{id && (
							<a className="py-1 inline-block font-medium text-sm truncate text-gray-600 hover:text-blue-500 focus:text-blue-500 focus:outline-none transition duration-150 ease-in-out" href={`#${hash}`}>
								{children.trim() || (
									"Untitled"
								)}
							</a>
						)}
						<ul>
							{secondary.map(({ id, hash, children }) => (
								<li key={id} onClick={e => newScrollHandler(e, id, hash)}>
									<a className="pl-4 py-1 inline-block font-medium text-sm truncate text-gray-600 hover:text-blue-500 focus:text-blue-500 focus:outline-none transition duration-150 ease-in-out" href={`#${hash}`}>
										{children.trim() || (
											"Untitled"
										)}
									</a>
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>

		</div>
	)
})

export default Outline
