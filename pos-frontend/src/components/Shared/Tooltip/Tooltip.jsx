import { Info } from '@/assets/SvgComponents';
import React, { useState } from 'react';
/**
 * Renders a tooltip component with an information icon.
 *
 * This component displays an information icon, and when hovered or focused,
 * it shows a tooltip with the provided information.
 *
 * @param {Object} props - The component props.
 * @param {string} props.information - The information to display in the tooltip.
 * @returns {JSX.Element} The rendered tooltip component.
 */

function Tooltip({ information }) {
    const [isTooltipVisible, setTooltipVisible] = useState(false);

    function showTooltip() {
        setTooltipVisible(true);
    }

    function hideTooltip() {
        setTooltipVisible(false);
    }

    return (
        <div className="">
            <a
                // href="./"
                tabIndex="0"
                aria-label="tooltip 1"
                className="outline-none rounded-full relative focus-visible:ring-2 focus-visible:ring-primary3/50 inline-block"
                onMouseOver={showTooltip}
                onFocus={showTooltip}
                onMouseOut={hideTooltip}
                onBlur={hideTooltip}
            >
                <div className="cursor-pointer">
                    <Info size={16} />
                </div>
                {isTooltipVisible && (
                    <div
                        id="tooltip1"
                        role="tooltip"
                        className="z-50 w-44 max-w-[70vw] absolute transition duration-150 ease-in-out left-0 top-full mt-2 shadow-lg bg-white p-2 text-xs rounded-lg"
                    >
                                                <p className="">{information}</p>
                    </div>
                )}
            </a>
        </div>
    );
}

export default Tooltip;