import React, { useEffect, useRef, useState } from 'react'
import StartComp from './authComp/StartComp'
import { Outlet } from 'react-router'
import { BackgroundIcon } from './authComp/Others'
import { AuthProvider } from './Context/AuthProvider';

export default function AuthWrapper() {
    const authRef = useRef();
    const [showBar, setShowBar] = useState(false);

    useEffect(() => {
        const authSide = authRef.current?.querySelector('.authOutlet');
        authSide?.classList.remove('hidden');
    }, []);
    return (
        <AuthProvider>
            <div ref={authRef} className="relative font-nunito flex h-screen overflow-y-auto overflow-x-hidden">
                <BackgroundIcon />
                <div className="hidden md:block md:w-2/5 lg:w-1/3 shrink-0 md:p-4">
                    <StartComp setShowBar={setShowBar} />
                </div>
                <div className="authOutlet flex-1 min-w-0 px-4 text-center flex flex-col justify-center">
                    <Outlet />
                </div>
            </div>
        </AuthProvider>
    )
}
