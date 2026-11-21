/**
 * Badge component displays a badge with customizable text and background color.
 *
 * @param {string} text - The text to display on the badge (default: 'completed').
 * @returns {JSX.Element} The rendered badge component.
 */
import React from "react";
const Badge = ({ text = 'active' }) => {
	const data = {
		active: {
			text: 'Active',
			bg: 'bg-[#CCF1E0]',
			dot: 'bg-primary1',
			color: 'text-primary2',
		},
		deactive: {
			text: 'Deactive',
			bg: 'bg-[#FFD9D9]',
			dot: 'bg-red',
			color: 'text-red',

		},
		available: {
			text: 'Available',
			bg: 'bg-[#CCF1E0]',
			dot: 'bg-primary1',
			color: 'text-primary2',
		},
		stockout: {
			text: 'Stock Out',
			bg: 'bg-[#FFD9D9]',
			dot: 'bg-red',
			color: 'text-red',

		},
	};
	return (
		<div
			className={`flex items-center gap-1.5 ${data[text]?.bg} rounded-full px-2 py-0.5 text-xs w-fit`}
		>
			<span className={`w-1.5 h-1.5 rounded-full ${data[text]?.dot}`}></span>
			<p className={`${data[text]?.color} whitespace-nowrap`}>{data[text]?.text || 'No Text'}</p>
		</div>
	);
};

export default Badge;
