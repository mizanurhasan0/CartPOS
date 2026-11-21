import React from 'react';
import { AuthFooter, AuthHeader, ErrCheck, RXEmail } from '../authComp/Others';
import Input from '@/components/Shared/Inputs/Input';
import { Link } from 'react-router-dom';
import { Button } from '@/components';
import { useForm } from 'react-hook-form';
import { useAuthCtx } from '../Context/AuthProvider';
import Loading from '@/pages/Loading/Landing';

// Optional demo-accounts table, driven by VITE_DEMO_LOGINS (JSON array). Nothing is shown unless it is set,
// so no credentials live in the source code or in production builds by default.
const DEMO_ACCOUNTS = (() => {
    try { const v = JSON.parse(import.meta.env.VITE_DEMO_LOGINS || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
})();

export default function LogWrapper() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { onUserLogin, loading } = useAuthCtx();

    const onsubmit = (data) => onUserLogin(data);

    return (
        <div className="min-h-full flex items-center w-full py-4">
            <div className="space-y-4 mx-auto w-full max-w-sm">
                {/* Header */}
                <AuthHeader title="Welcome Back" subTitle="Sign in to continue" />
                {/* Form */}
                <form onSubmit={handleSubmit(onsubmit)}>
                    <div className="text-left space-y-3 caret-primary5">
                        <Input label="Email" placeholder="Enter your email..." rest={{
                            ...register('email', {
                                pattern: {
                                    value: RXEmail.emailValid,
                                    message: 'Invalid email address',
                                },
                            }), required: true
                        }} error={ErrCheck(errors, 'email')} />
                        <Input label="Password" type='password' placeholder="Enter your password..." rest={{
                            ...register('password', { required: "This is required." })

                        }}
                            error={ErrCheck(errors, 'password')}
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input id="rememberMe" type="checkbox" {...register('remember')} />
                                <label htmlFor="rememberMe" className="text-xs font-normal">Remember me</label>
                            </div>
                            <Link to="/auth/forget" className="text-xs font-normal hover:underline">Forget your password?</Link>
                        </div>
                        <Button type="submit" className="w-full">Login</Button>
                    </div>
                </form>
                {/* Footer */}
                <AuthFooter />
                {/* Demo accounts (only when VITE_DEMO_LOGINS is configured) */}
                {DEMO_ACCOUNTS.length > 0 && <div className="rounded-xl border border-border text-left text-xs overflow-hidden">
                    <p className="px-3 py-1.5 font-semibold text-primary bg-light/60">Demo accounts</p>
                    <table className="w-full">
                        <thead>
                            <tr className="text-label"><th style={{ display: 'table-cell' }} className="px-3 py-1 font-semibold">Role</th><th className="px-3 py-1 font-semibold">Email</th><th className="px-3 py-1 font-semibold">Password</th></tr>
                        </thead>
                        <tbody>
                            {DEMO_ACCOUNTS.map((a) => (
                                <tr key={a.role} className="border-t border-border">
                                    <td style={{ display: 'table-cell' }} className="px-3 py-1.5 font-semibold capitalize">{a.role}</td>
                                    <td className="px-3 py-1.5 select-all">{a.email}</td>
                                    <td className="px-3 py-1.5 select-all font-mono">{a.password}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
            {/* Loading Components */}
            {loading ? <div className="fixed inset-0 z-[1000] bg-white/60"><Loading /></div> : ''}
        </div>
    )
}
