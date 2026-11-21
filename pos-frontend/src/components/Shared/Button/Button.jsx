import React from 'react';

/**
 * Button Component
 *
 * A reusable button component with customizable styles and click event handling.
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.style='primary'] - The style of the button.
 * @param {string} [props.className=''] - Additional CSS classes for the button.
 * @param {ReactNode} [props.children=''] - The content to be displayed inside the button.
 * @param {function} [props.onClick=''] - The onClick event handler for the button.
 *
 * @returns {ReactNode} The rendered button component.
 */

const styles = {
  primary: 'bg-primary2 hover:bg-primary3 text-white py-1.5 px-4 font-nunito font-bold text-sm whitespace-nowrap',
  secondary: 'bg-primary2 hover:bg-primary3 text-white py-1.5 px-4 font-nunito font-bold text-sm whitespace-nowrap',
  small: 'bg-primary2 hover:bg-primary3 text-white py-1 px-3 font-nunito font-normal text-xs whitespace-nowrap',
  outline: 'border border-primary hover:bg-primary/5 rounded-full py-1 px-4 text-sm font-semibold text-primary font-nunito whitespace-nowrap',
  custom: '',
};

const Button = ({
  style = 'primary', // Default style to 'primary'
  className = '',
  type = 'button',
  children = '',
  onClick,
  rest
}) => {
  return (
    <button
      className={` ${styles[style]} ${className} rounded-full inline-flex items-center justify-center gap-2 transition active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary3/50 focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:grayscale disabled:active:scale-100`}
      onClick={onClick} type={type} {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
