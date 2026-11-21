import React from 'react';
import layout from '../../assets/Images/layout.png'

const TEXT = "Learn about the key features and functionalities of CartPOS and get a high-level understanding of how to navigate and use the dashboard.";

const HelpCenter = () => {
    return (
        <div>
            <h1 className="text-lg font-semibold text-primary mb-3">Help Center</h1>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
                <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                    <div className="rounded-xl border border-border p-3">
                        <p className="text-primary2 font-semibold text-sm">Overview</p>
                        <p className="text-xs text-primary mt-1">{TEXT}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                        <p className="text-primary2 font-semibold text-sm">Dashboard</p>
                        <p className="text-xs text-primary mt-1">{TEXT}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                        <p className="text-primary2 font-semibold text-sm">Users</p>
                        <p className="text-xs text-primary mt-1">{TEXT}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                        <p className="text-primary2 font-semibold text-sm">Settings</p>
                        <p className="text-xs text-primary mt-1">{TEXT}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                        <p className="text-primary2 font-semibold text-sm">Organization</p>
                        <p className="text-xs text-primary mt-1">{TEXT}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                        <p className="text-primary2 font-semibold text-sm">Logout</p>
                        <p className="text-xs text-primary mt-1">{TEXT}</p>
                    </div>
                </div>
                <div className="hidden lg:flex rounded-xl border border-border p-3 items-center justify-center lg:sticky lg:top-20 self-start">
                    <img className='max-h-[60vh] w-auto object-contain' src={layout} alt="" />
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
