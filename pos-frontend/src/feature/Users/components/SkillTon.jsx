import React from 'react'

export default function SkillTon() {
    return (
        <div className="space-y-3 max-w-3xl">
            <div className="bg-[#e0dfdf] w-40 h-7 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-[#e0dfdf] h-9 rounded-full animate-pulse" />)}
            </div>
        </div>
    )
}
