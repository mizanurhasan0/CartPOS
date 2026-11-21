/**
 * Simple Card Wrapper for all cards components.
 * 
 * @param {string} [props.style] - style of Card wrapper. default normal, custom.
 * @param {Object} [props.children] - JSX Elements.
 * 
 * @return JSX Element Card
 */
import React from 'react';
const styles= {
    normal: 'rounded-3xl border-2 border-light p-6 w-full md:w-auto h-fit',
    custom: ''
};
const CardWrapper = ({style='normal',children, className}) => {
    return (
        <div className={`${styles[style]} ${className}`}>
            {children}
        </div>
    );
};

export default CardWrapper;