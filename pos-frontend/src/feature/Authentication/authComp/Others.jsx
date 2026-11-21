import { BGCircle, Logo } from '@/assets/SvgComponents';
import React from 'react';
import toast from 'react-hot-toast';

const RXEmail = {
    emailValid: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
}
function ErrCheck(errors, keyName) {
    return Object.keys(errors).includes(keyName)
}
function AuthHeader({ title, subTitle }) {
    return (
        <div className="flex flex-col items-center gap-1 text-primary1 font-normal">
            <div className="flex items-center gap-2 mb-1">
                <Logo className="stroke-primary2 h-7 w-7" />
                <p className="text-2xl font-semibold text-primary2">CartPOS</p>
            </div>
            <p className="text-lg font-semibold">{title}</p>
            {subTitle ? <span className="text-xs">{subTitle}</span> : null}
        </div>
    )
}
function AuthFooter({ option }) {
    return (
        <p className="text-center text-xs font-semibold text-[#565656]">{option ? 'Already' : 'You dont'} have any account?
            <button type="button" onClick={(() => toast.error('Contact your super admin!'))} className="text-primary hover:underline cursor-pointer">&nbsp;Sign up</button>
        </p>
    )
}
function BackgroundIcon() {
    return (
        <BGCircle className="absolute -right-12 xl:-right-24 top-0 w-[12rem] h-[12rem] xl:w-[20rem] xl:h-[20rem] transition-all duration-300 -z-10" />
    )
}

export { AuthHeader, AuthFooter, BackgroundIcon, RXEmail, ErrCheck }
