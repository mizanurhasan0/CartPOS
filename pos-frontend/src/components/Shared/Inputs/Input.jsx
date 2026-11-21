/**
 * Input Component
 *
 * A reusable input component with customizable styles and attributes.
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.style='style1'] - The style of the input.
 * @param {string} [props.className=''] - Additional CSS classes for the input.
 * @param {string} [props.id=''] - The HTML id attribute for the input.
 * @param {string} [props.name=''] - The HTML name attribute for the input.
 * @param {string} [props.value=''] - The value attribute for the input.
 * @param {function} [props.onChange=''] - The onChange event handler for the input.
 * @param {function} [props.onBlur=''] - The onBlur event handler for the input.
 * @param {Object} [props.rest={}] - Additional props to be spread onto the input element.
 * @param {ReactNode} [props.children=''] - The content to be displayed inside the input.
 *
 * @returns {ReactNode} The rendered input component.
 */
import React, { useRef } from 'react';
import searchIcon from '../../../assets/Icons/search.svg';
import plus from '../../../assets/Icons/plus.svg';
import minus from '../../../assets/Icons/minus.svg';
const focusCls = 'outline-none focus:ring-2 focus:ring-primary3/40 focus:border-primary3 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50';
const styles = {
  primary: 'border border-[#88A4AB] rounded-full text-primary2 placeholder-label text-sm font-nunito bg-white',
  secondary: 'border border-[#001E174d] rounded-full text-primary placeholder-primary text-sm font-nunito bg-white',
  custom: '',
};
const labelStyle = {
  primary: 'text-primary1',
  secondary: 'text-primary',
}
const labelCls = 'text-xs font-semibold mb-1';
const inputSize = {
  xl: 'h-12',
  lg: 'h-11',
  md: 'h-9',
  sm: 'h-8',
}
const Input = ({
  style = 'primary',
  className = '',
  id,
  name = '',
  value,
  onChange,
  type = 'text',
  onBlur,
  rest = {},
  placeholder = '',
  size = 'md',
  label = '',
  error,
  min = 0,
  max = Infinity,
  flexgrow = false
}) => {
  const quantityRef = useRef();
  const decrementHandler = () => {
    const current = Number(quantityRef.current.value);
    if ((current > min) && (current <= max)) {
      quantityRef.current.value = current - 1;
      onChange({ target: { value: quantityRef.current.value } });
    }
  }
  const incrementHandler = () => {
    const current = Number(quantityRef.current.value);
    if ((current < max) && (current >= min)) {
      quantityRef.current.value = Number(quantityRef.current.value) + 1;
      onChange({ target: { value: quantityRef.current.value } });
    }
  }

  if (type === 'search') {
    return (
      <div className={`flex gap-2 items-center border px-3 border-label rounded-full bg-white focus-within:ring-2 focus-within:ring-primary3/40 focus-within:border-primary3 transition ${className} ${inputSize[size]}`}>
        <img className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} src={searchIcon} alt="" />
        <input
          className={`text-label text-sm bg-transparent focus:outline-none w-full min-w-0`}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={type}
          placeholder={placeholder}
          {...rest}
        />
      </div>
    );
  } else if (type === 'quantity') {
    return (
      <div className={`flex flex-col ${flexgrow ? 'grow' : ''}`}>
        {label ? <label className={`${labelStyle[style]} ${labelCls}`} htmlFor={id}>{label}</label> : null}
        {/*  px-6 */}
        <div className={`${styles[style]} ${inputSize[size]} ${error ? 'border-danger' : ''} flex items-center justify-between px-3 focus-within:ring-2 focus-within:ring-primary3/40 focus-within:border-primary3 transition ${className}`} >
          <img className='cursor-pointer h-4 w-4 hover:opacity-70 active:scale-90 transition' onClick={() => decrementHandler(value)} src={minus} alt="" />
          <input
            className={`bg-transparent focus:outline-none w-full min-w-[2rem] text-center`}
            style={{ borderColor: error ? 'red' : '' }}
            ref={quantityRef}
            id={id}
            name={name}
            value={value}
            onChange={(e) => {
              if ((Number(e.target.value) >= min) && (Number(e.target.value) <= max)) {
                onChange(e)
              }
            }}
            onBlur={onBlur}
            type={'number'}
            min={min}
            max={max}
            placeholder={placeholder}
            {...rest}
          />
          <img className='cursor-pointer h-4 w-4 hover:opacity-70 active:scale-90 transition' onClick={() => incrementHandler(value)} src={plus} alt="" />
        </div>
      </div>
    )
  } else {
    return (
      <div className='flex flex-col'>
        {label ? <label className={`${labelStyle[style]} ${labelCls}`} htmlFor={id}>{label}</label> : null}
        <input
          className={`${styles[style]} ${className} ${inputSize[size]} ${focusCls} px-4 focus:placeholder:opacity-0 w-full`}
          style={{ borderColor: error ? 'red' : '' }}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={type}
          min={min}
          max={max}
          placeholder={placeholder}
          {...rest}
        />
      </div>
    );
  }
};

export default Input;