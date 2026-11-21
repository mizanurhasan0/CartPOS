import React from "react";
import PosIcon from '../../assets/Icons/PosIcon.svg';
import { BillIcon, DashboardIcon, HelpIcon, HistoryIcon, InventoryIcon, LogoutIcon, OrganizationIcon, SalesIcon, SettingsIcon, UsersIcon, AccountsIcon, DefaultStore } from "@/assets/SvgComponents";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const common = [
    { title: 'Settings', icon: SettingsIcon, link: '/settings' },
    { title: 'Help Center', icon: HelpIcon, link: '/helpCenter' },
    { title: 'Log Out', icon: LogoutIcon, link: '/logout' },
];

const NAV = {
    user: [
        { title: 'Sales', icon: SalesIcon, link: '/user-sales' },
        { title: 'Inventory', icon: InventoryIcon, link: '/inventory' },
        { title: 'Bill', icon: BillIcon, link: '/bill' },
        ...common,
    ],
    admin: [
        { title: 'Dashboard', icon: DashboardIcon, link: '/' },
        { title: 'Sales', icon: SalesIcon, link: '/user-sales' },
        { title: 'Users', icon: UsersIcon, link: '/users' },
        { title: 'Inventory', icon: InventoryIcon, link: '/inventory' },
        { title: 'History', icon: HistoryIcon, link: '/history' },
        { title: 'Bill', icon: BillIcon, link: '/bill' },
        { title: 'Refund', icon: BillIcon, link: '/refund' },
        { title: 'Accounts', icon: AccountsIcon, link: '/accounts' },
        ...common,
    ],
    superadmin: [
        { title: 'Dashboard', icon: DashboardIcon, link: '/' },
        { title: 'Organization', icon: OrganizationIcon, link: '/organization' },
        { title: 'Users', icon: UsersIcon, link: '/users' },
        ...common,
    ],
};

function SidebarContent({ onNavigate }) {
    const { user } = useSelector(state => state.authStore);
    const items = NAV[user?.role] || [];
    const isSuper = user?.role === 'superadmin';
    const logoSrc = isSuper ? PosIcon : (user?.store?.image ? import.meta.env.VITE_SERVER_URL + '/file/' + user.store.image : DefaultStore);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-4 mb-2 border-b border-white/10">
                <img className="w-9 h-9 rounded-full object-cover shrink-0" src={logoSrc} alt="" onError={(e) => { e.target.src = DefaultStore; }} />
                <p className="text-base leading-5 font-semibold text-light line-clamp-2 capitalize">{isSuper ? 'CartPOS' : (user?.store?.name || 'Pos')}</p>
            </div>
            <nav className="flex flex-col gap-0.5 px-2 pb-4 overflow-y-auto scrollbar">
                {items.map((item) => (
                    <NavLink to={item.link} key={item.link} end={item.link === '/'} onClick={onNavigate}>
                        {({ isActive }) => (
                            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-primary4' : 'text-light hover:bg-white/5'}`}>
                                <item.icon stroke={isActive ? '#0CABA8' : '#E2E8F0'} fill="transparent" className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-semibold">{item.title}</span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

export default function Sidebar({ show, sideRef, setSidebarOpen }) {
    const close = () => setSidebarOpen(false);
    return (
        <>
            {/* desktop / tablet: fixed compact rail */}
            <aside id="sideBar2" className="hidden md:block w-52 shrink-0 bg-primary1 h-full overflow-y-auto scrollbar">
                <SidebarContent />
            </aside>
            {/* phone: slide-over drawer */}
            {show && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={close} />
                    <aside id="sideBar" ref={sideRef} className="fixed inset-y-0 left-0 z-40 w-64 bg-primary1 md:hidden shadow-xl">
                        <SidebarContent onNavigate={close} />
                    </aside>
                </>
            )}
        </>
    );
}
