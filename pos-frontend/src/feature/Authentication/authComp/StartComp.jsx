import React from 'react'
import { Logo } from '@/assets/SvgComponents.jsx'

export default function StartComp() {
    return (
        <div className="bg-primary1 h-full text-light flex flex-col justify-center items-start gap-3 py-8 px-8 xl:px-12 md:rounded-lg overflow-hidden">
            <div className="flex items-center gap-3">
                <Logo className="stroke-light" />
                <h1 className="text-3xl font-semibold">CartPOS</h1>
            </div>
            <p className="text-xl font-semibold leading-6">Start your journey with us</p>
            <p className="text-sm opacity-80">Fast, simple point of sale for your business.</p>
        </div >
    )
}
