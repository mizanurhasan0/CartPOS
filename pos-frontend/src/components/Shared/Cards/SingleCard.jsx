/**
 * SingleCard Component
 *
 * This component represents a single card with customizable content, such as an icon, title, and amount.
 * @param {string} style = The style of card (e.g., 'single', 'multiple').
 * @param {string} type - The type of the card (e.g., 'general' or 'currency').
 * @param {JSX.Element} icon - The icon to be displayed on the card.
 * @param {string} title - The title of the card.
 * @param {number} amount - The amount or value to be displayed on the card.
 *
 * @example
 * // Example usage of SingleCard component:
 * <SingleCard type="currency" icon={<CurrencyIcon />} title="Total Earnings" amount={1000} />
 *
 * @returns {JSX.Element} The SingleCard component.
 */

import React from 'react';
import CardWrapper from './CardWrapper';
import { useSelector } from 'react-redux';

const SingleCard = ({ style = 'single', type = 'general', icon, title = "title", amount = 0 }) => {
    const currency = useSelector((state) => state.storeStore?.store?.currency  || {symbol: "$"});
    if (style === 'multiple') {
        return (
            <div className="flex gap-[1rem] xl:gap-10 justify-start items-center">
                <div className="">{icon}</div>
                <div className="">
                    <p className="text-primary1 text-xs md:text-sm font-semibold font-nunito leading-[0.875rem] line-clamp-2">{title}</p>
                    <p className="text-black text-base font-semibold">{type === 'currency' ? currency.symbol + " " : ''} {type === 'currency' ? Number(amount).toFixed(2) : amount}</p>
                </div>
            </div>
        );
    } else {
        return (
            <CardWrapper style='custom' className='rounded-3xl border-2 border-light py-4 px-4 w-full md:w-auto h-fit'>
                <div className="flex justify-between lg:items-center w-full md:min-w-[11.75rem] flex-col-reverse lg:flex-row gap-3  min-h-[150px] sm:min-h-fit">
                    <div className="grid gap-2 ">
                        <p className="text-black text-xl sm:text-2xl font-semibold">{type === 'currency' ? currency.symbol + " "  : ''}{type === 'currency' ? Number(amount).toFixed(2) : amount}</p>
                        <p className="text-primary2">{title}</p>
                    </div>
                    <div className="">{icon}</div>
                </div>
            </CardWrapper>
        );
    }
};

export default SingleCard;
