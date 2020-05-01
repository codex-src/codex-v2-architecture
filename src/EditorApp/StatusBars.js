import React from "react"

const StatusBars = ({ children: [lhs, rhs] }) => (
	<div className="fixed inset-0 hidden xl:flex flex-row items-end pointer-events-none">
		<div className="px-3 py-2 flex flex-row justify-between w-full">
			<p className="font-medium text-xxs pointer-events-auto" style={{ fontFeatureSettings: "'tnum'" }}>
				{lhs}
			</p>
			<p className="font-medium text-xxs pointer-events-auto" style={{ fontFeatureSettings: "'tnum'" }}>
				{rhs}
			</p>
		</div>
	</div>
)

export default StatusBars
