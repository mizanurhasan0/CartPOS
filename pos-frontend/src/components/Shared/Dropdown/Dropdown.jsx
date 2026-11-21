
import React, { useEffect, useState, useRef } from 'react';
import Arrow from '../../../assets/Icons/arrow-down.svg?react'
import Arrowdown from '../../../assets/Icons/CarretDown.svg?react';
/**
 * A custom dropdown/select input component.
 *
 * @component
 * @param {Object} props - The component's props.
 * @param {Array} props.data - An array of items to populate the dropdown.
 * @param {string} [props.type='dropdown'] - The type of dropdown ('dropdown' or 'input').
 * @param {function} [props.onChange=() => {}] - A function to be called when the selection changes.
 * @param {boolean} props.error - Indicates whether there's an error in the dropdown.
 * @param {string} [props.placeholder='Select'] - The placeholder text when nothing is selected.
 * @param {string} [props.label='label'] - The label for the dropdown.
 * @param {boolean} [props.other=false] - Whether to include an 'Add New' option.
 * @param {string} [props.className=''] - Additional CSS classes for styling.
 * @returns {React.Component} The Dropdown component.
 */


const Dropdown = ({ defaultValue, data, type = 'dropdown', onScroll = () => { }, onChange = () => { }, error, placeholder = 'Select', label = 'label', other = false, className = '', addCt = false, onAdd = () => { }, modalClass = 'w-full' }) => {
    const [selected, setSelected] = useState(defaultValue || null);

    const [isOpen, setIsOpen] = useState(false);
    const [isClicked, setClicked] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        inputRef.current.value = "";
        setClicked(false)
    }
    // useEffect(() => {
    //     setSelected(data[0] || null);
    // }, [data]);

    // useEffect(() => {
    //     setSelected(defaultValue)
    // }, [defaultValue, data]);

    useEffect(() => {
        // Close the dropdown when the user clicks outside of it
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setClicked(false);
            }
        }

        // Add event listener when the dropdown is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);

        } else {
            // Remove the event listener when the dropdown is closed
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    if (type === 'input') {
        return (
            <div className='flex flex-col bg-white'>
                <label className='text-primary text-xs font-semibold mb-1' htmlFor="">{label}</label>
                <div className="relative" ref={dropdownRef}>
                    <div onClick={toggleDropdown} className={`h-9 gap-2 pl-4 pr-2 rounded-full border ${error ? 'border-danger' : 'border-label'} flex justify-between items-center cursor-pointer hover:border-primary3 transition ${isOpen ? 'ring-2 ring-primary3/40 border-primary3' : ''} ${className}`}>
                        <p className="text-primary2 text-sm truncate">
                            {selected ? selected.name : placeholder}
                        </p>
                        <Arrow className='bg-primary1 rounded-full py-1 px-1 stroke-white h-6 w-6' />
                    </div>
                    <ul onScroll={onScroll} className={`${isOpen ? '' : 'hidden'} border border-label absolute left-0 max-h-[13rem] max-w-[calc(100vw-2rem)] rounded-lg mt-1 overflow-y-auto z-50 shadow-lg text-sm ${modalClass} bg-white`}>
                        {data?.map((item) => (
                            <li
                                onClick={() => { setSelected(item); setIsOpen(false); onChange(item) }}
                                key={item.id}
                                className={`${selected?.id === item?.id ? 'text-white bg-primary2' : 'text-primary1 bg-white'}  py-1.5 px-4 hover:bg-primary2 hover:text-white cursor-pointer whitespace-nowrap `}
                            >
                                {item.name}
                            </li>
                        ))}
                        {addCt && ((other && !isClicked) ? other && <li
                            onClick={() => { setClicked(true); setTimeout(() => inputRef.current.focus(), 500); }}
                            className={` text-primary1 bg-white  py-1.5 px-4 hover:bg-primary2 hover:text-white cursor-pointer `}

                        >Add New</li> : <div className='flex items-center'><div className=' px-6 bg-white' >
                            <input ref={inputRef} className='w-full border border-label focus:outline-none py-1.5 px-4 my-2 rounded-sm' type="text" placeholder='Add new' name="" id="" />
                        </div><button type='button' className='bg-primary2 text-white p-2 rounded-sm mr-2' onClick={() => { onAdd(inputRef.current.value); inputRef.current.value = '' }}>Add</button></div>)

                        } 

                    </ul>
                </div>
            </div>
        );
    } else {
        return (
            <div className='flex flex-col '>
                <label className='text-primary text-xs font-semibold mb-1' htmlFor="">{label}</label>
                <div className="relative" ref={dropdownRef}>
                    <div onClick={toggleDropdown} className={`h-9 gap-2 pl-3 pr-2 rounded-md border bg-primary1 hover:bg-primary3 transition flex justify-between items-center cursor-pointer ${className}`}>
                        <p className="text-white text-sm truncate">
                            {selected ? selected.name : placeholder}
                        </p>
                        <Arrowdown className='bg-primary1 rounded-full ml-1 fill-white ' />
                    </div>
                    <ul onScroll={onScroll} className={`${isOpen ? '' : 'hidden'} bg-white border border-label absolute left-0 max-h-[13rem] max-w-[calc(100vw-2rem)] rounded-lg mt-1 overflow-y-auto z-50 shadow-lg text-sm ${modalClass}`}>
                        {data?.map((item) => (
                            <li
                                onClick={() => { setSelected(item); setIsOpen(false); onChange(item) }}
                                key={item.id}
                                className={`${selected?.id === item?.id ? 'text-white bg-primary2' : 'text-primary1 bg-white'}  py-1.5 px-4 hover:bg-primary2 hover:text-white cursor-pointer `}
                            >
                                {item.name}
                            </li>
                        ))}
                        {other &&
                            !isClicked ? <li
                                onClick={() => setClicked(true)}
                                className={` text-primary1 bg-white  py-1.5 px-4 hover:bg-primary2 hover:text-white cursor-pointer `}

                            >Add New</li> : other && <form className='bg-white px-6' onSubmit={handleSubmit}>
                                <input ref={inputRef} className='w-full border border-label focus:outline-none py-1.5 px-4 mb-2 rounded-full' type="text" placeholder='Add new' name="" id="" />
                            </form>
                        }

                    </ul>
                </div>
            </div>
        );
    }
};

export default Dropdown;
