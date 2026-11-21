/**
 * Modal Component
 *
 * A reusable modal dialog component that can be shown or hidden.
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.type] - Type of modal.
 * @param {boolean} [props.show=false] - Whether the modal is visible or hidden.
 * @param {function} props.onClose - A function to be called when the modal is closed.
 * @param {ReactNode} props.children - The content to be displayed within the modal.
 *
 * @returns {ReactNode} The rendered modal component.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Close from '../../../assets/Icons/cancel.svg?react'
const Modal = ({ show=false, onClose, children }) => {

    return ReactDOM.createPortal(
        <div className={`modal absolute ${show ? '' : 'scale-0'}`}>
            <div className="fixed z-[999] inset-0 bg-black/55" onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
                <div className={`fixed inset-0 flex items-center justify-center pointer-events-none duration-300 ${show ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
                    <div className="relative pointer-events-auto bg-white rounded-lg shadow-xl p-4 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
                        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-2 top-2 z-10 rounded-full p-1.5 hover:bg-primary5/20 active:scale-90 transition outline-none focus-visible:ring-2 focus-visible:ring-primary3/50">
                            <Close className="fill-primary h-4 w-4" />
                        </button>
                        <div className="pt-4">{children}</div>
                    </div>
                </div>
            </div>
        </div>,
        document.querySelector("#modal")
    );
};

export default Modal;
