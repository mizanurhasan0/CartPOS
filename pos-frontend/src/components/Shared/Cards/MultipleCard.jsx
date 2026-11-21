/**
 * MultipleCard Component
 *
 * This component represents a card that can hold multiple child components in a grid layout.
 *
 * @param {string} title - The title for the card.
 * @param {Function} reload - A callback function to handle reloading or refreshing the card's content.
 * @param {ReactNode} children - The child components to be displayed in a grid within the card.
 *
 * @returns {JSX.Element} The MultipleCard component.
 */

import React from 'react';
import CardWrapper from './CardWrapper';
import ReloadIcon from '../../../assets/Icons/reload.svg?react';
import loader from '../../../assets/Icons/loader.png';

const MultipleCard = ({ title = 'title', reload, shouldReload, children, setTarget, name, target }) => {
    return (
        <div className="w-auto min-w-full md:min-w-[29rem]">
            <CardWrapper>
                <div className="flex justify-between mb-6">
                    <p className="text-primary2 font-semibold">{title}</p>
                    <ReloadIcon onClick={() => { reload(); setTarget(name); }} className='stroke-primary4 cursor-pointer' />
                </div>
                <div className='grid grid-cols-2 grid-rows-2 gap-x-[4.125rem] gap-y-[3.5rem]'>
                    {shouldReload && target === name ? (
                        <div className="col-span-2">
                            <div className="flex justify-center items-center w-full h-full">
                                <img className='w-10 h-10 clockwise' src={loader} alt="" />
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </CardWrapper>
        </div>
    );
};

export default MultipleCard;
