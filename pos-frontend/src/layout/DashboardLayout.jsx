import Navbar from '@/pages/Dashboard/Navbar';
import Sidebar from '@/pages/Dashboard/SideBar';
import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';


export default function DashboardLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };
    const sideRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            if (sideRef.current && !sideRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        }
        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);

        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar sideRef={sideRef} show={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 min-w-0 flex flex-col">
                <header id='navBar' className="h-14 shrink-0 border-b border-light z-10 bg-white">
                    <Navbar onSidebarToggle={toggleSidebar} />
                </header>
                <main className="flex-1 overflow-y-auto scrollbar px-4 lg:px-6 py-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
