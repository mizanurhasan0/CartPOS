import React from 'react'
import { AuthFooter, AuthHeader, RXEmail } from '../authComp/Others'
import Input from '@/components/Shared/Inputs/Input'
import { Button } from '@/components'
import { useForm } from 'react-hook-form'

export default function RegWrapper() {
    const { register, handleSubmit } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };
    return (
        <div className="min-h-full flex items-center w-full py-4">
            <div className="space-y-4 mx-auto w-full max-w-sm">
                {/* Header */}
                <AuthHeader title="Create your account " subTitle="It’s time to POS" />
                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="text-left space-y-3">
                        <Input label="Full Name" placeholder="Enter your fullname..." rest={{ ...register('fullname'), required: true }} />
                        <Input label="Email" placeholder="Enter your email..." rest={{
                            ...register('email', {
                                pattern: {
                                    value: RXEmail.emailValid,
                                    message: 'Invalid email address',
                                },
                            }), required: true
                        }} />
                        <Input label="Organization Name" placeholder="Enter your organization..." rest={{ ...register('orgName'), required: true }} />
                        <Input label="Address" placeholder="Enter your address..." rest={{ ...register('address'), required: true }} />
                        <Input label="Password" placeholder="Enter your password..." rest={{ ...register('password'), required: true }} />
                        <Input label="Confirm Password" placeholder="Enter your re-password..." rest={{ ...register('confPassword'), required: true }} />
                        <Button type="submit" className="w-full">Sign Up</Button>
                    </div>
                </form>
                {/* Footer */}
                <AuthFooter option={true} />
            </div>
        </div>
    )
}
