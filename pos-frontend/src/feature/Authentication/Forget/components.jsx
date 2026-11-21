import React from 'react'
import { AuthHeader, ErrCheck, RXEmail } from '../authComp/Others'
import { useForm } from 'react-hook-form';
import Input from '@/components/Shared/Inputs/Input';
import { Button } from '@/components';
import { useAuthCtx } from '../Context/AuthProvider';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

function EmailComp({ setOption }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { onSetOTP } = useAuthCtx();
    const onSubmit = (data) => onSetOTP({ data, setOption });

    // if (!loading) return <div className="absolute w-full h-screen top-0 right-0"><Loading /></div>
    return (
        <>
            <AuthHeader title="Forget your password" subTitle="Search your account through email address" />
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="text-left space-y-3">
                    <Input label="Email" placeholder="Enter your email..." rest={{
                        ...register('email', {
                            pattern: {
                                value: RXEmail.emailValid,
                                message: 'Invalid email address',
                            },
                        }), required: true
                    }}
                        error={ErrCheck(errors, 'email')} />
                    <Button type="submit" className="w-full">Next</Button>
                </div>
            </form>
        </>
    )
}
function OTPComp({ setOption }) {
    const { register, handleSubmit } = useForm();
    const { onVerifyOTP } = useAuthCtx();
    const {forget } = useSelector(state => state.authStore);
    const email = forget.email[0] + forget.email.split('@')[0].slice(0, forget.email.split('@')[0].length - 1).replace(/./g,'*') + "@" + forget.email.split('@')[1]
    const onSubmit = (data) => onVerifyOTP({ data, setOption });

    return (
        <>
            <AuthHeader title="Account recovery" subTitle="To help keep your account safe,
POS wants to make sure it’s really you trying to sign in" />
            <div>
                <h1 className="text-sm font-semibold">Get a verification code</h1>
                <p className="text-xs font-normal text-primary1">To get a verification code, first confirm the phone number you added to your account {email} Standard rates apply.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="text-left space-y-3">
                    <Input label="OTP" placeholder="Active Code" rest={{ ...register('otp'), required: true }} />
                    <Button type="submit" className="w-full">Next</Button>
                </div>
            </form>
        </>
    )
}
function NewPassComp() {
    const { register, handleSubmit } = useForm();
    const { onNewPass } = useAuthCtx();

    const onSubmit = (data) => {
        try {
            const { password, confirmPassword } = data;
            if (password !== confirmPassword) throw new Error(toast.error('Password not match!'))
            onNewPass({ data })
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <AuthHeader title="Create New Password" subTitle="Create new password for your account" />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="text-left space-y-3">
                    <Input label="Create new Password" type="password" placeholder="Password" rest={{ ...register('password'), required: true }} />
                    <Input label="Confirm Password" type="password" placeholder="Re-password" rest={{ ...register('confirmPassword'), required: true }} />
                    <Button type="submit" className="w-full">Confirm</Button>
                </div>
            </form>
        </>
    )
}
export { EmailComp, OTPComp, NewPassComp }