import React, { useState } from 'react'
import { EmailComp, NewPassComp, OTPComp } from './components'
import { useAuthCtx } from '../Context/AuthProvider';
import Loading from '@/pages/Loading/Landing';

const data = {
    EmailComp: ({ setOption }) => <EmailComp setOption={setOption} />,
    OTPComp: ({ setOption }) => <OTPComp setOption={setOption} />,
    NewPassComp: ({ setOption }) => <NewPassComp setOption={setOption} />,
}
export default function ForWrapper() {
    const [option, setOption] = useState('EmailComp');
    const { loading } = useAuthCtx();

    return (
        <div className="min-h-full flex items-center w-full py-4">
            <div className="space-y-4 mx-auto w-full max-w-sm">
                {data[option]({ setOption })}
            </div>
            {loading ? <div className="fixed inset-0 z-[1000] bg-white/60"><Loading /></div> : ''}
        </div>
    )
}
