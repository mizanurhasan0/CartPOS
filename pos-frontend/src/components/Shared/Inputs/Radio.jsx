/**
 * Radio Component
 *
 * This component represents a set of radio buttons with customizable data options. It allows users to select one option at a time and provides an `onChange` callback to handle selection changes.
 *
 * @param {Array} data - An array of objects, each containing 'title' and 'value' properties to define the options.
 * @param {Function} onChange - A callback function that is called when the selected option changes.
 *
 * @returns {JSX.Element} The Radio component.
 */

import React, { useEffect, useState } from 'react';
import RadioActive from '../../../assets/Icons/radio-active.svg?react';
import RadioDeactive from '../../../assets/Icons/Radio.svg?react';

const Radio = ({ data = [{ title: 'title', value: 'value' }], onChange=()=>{} }) => {
    const [state, setState] = useState(data[0]);

    useEffect(() => {
        onChange(state);
    }, [state]);

    return (
        <div className='w-fit flex items-center justify-between gap-4'>
            {data?.map((item, index) => {
                return (
                    <div onClick={() => setState(item)} className="cursor-pointer flex items-center gap-4" key={index}>
                        {state?.value === item.value ? <RadioActive /> : <RadioDeactive />}
                        <span className="text-black">{item?.title}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default Radio;
