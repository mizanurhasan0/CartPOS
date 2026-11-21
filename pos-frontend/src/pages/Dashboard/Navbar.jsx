
import React, { useEffect, useRef } from 'react';
import { NavIcon, NotificationIcon } from '@/assets/SvgComponents';
// import Input from '@/components/Shared/Inputs/Input';
import { useDispatch, useSelector } from 'react-redux';
import Notification from './Notification';
import { setSeen } from '@/store/Reducer/notificationSlice';
import person from '../../assets/Images/person.png'

export default function Navbar({ onSidebarToggle }) {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.authStore);
    const { notStocks, seen } = useSelector((state) => state.notificationStore);

    const notiRef = useRef();

    const onShowNotification = () => {
        notiRef.current.classList.toggle('hidden');
        dispatch(setSeen(false));
    }
    useEffect(() => {
        const onOutsideClickEvent = (e) => {
            if (notiRef?.current?.contains && !notiRef.current.contains(e.target) && !notiRef.current.classList.contains('hidden')) {
                notiRef.current.classList.add('hidden');
            }
        };
        document.addEventListener('mousedown', onOutsideClickEvent);
        return () => document.removeEventListener('mousedown', onOutsideClickEvent);
    }, []);
    return (
        <nav className="h-full px-4 lg:px-6 flex items-center justify-between">
            <button className="md:hidden p-1 -ml-1" onClick={onSidebarToggle} aria-label="Open menu">
                <NavIcon />
            </button>
            <div className="inter-font flex items-center gap-3 ml-auto relative">
                <div className="text-right leading-tight">
                    <p className="text-sm font-semibold">{user?.fullName}</p>
                    <p className="text-xs font-medium text-black2">{user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'}</p>
                </div>
                {
                    user?.image ? <img className='w-9 h-9 rounded-full object-cover' src={import.meta.env.VITE_SERVER_URL + '/file/' + user?.image} onError={(e) => e.target.src = `${person}`} />
                        : <div className='bg-yellow w-9 h-9 rounded-full flex justify-center items-center text-lg'>{user?.fullName ? user?.fullName[0] : 'X'}</div>
                }
                <div className="relative">
                    <NotificationIcon onClick={onShowNotification} className="cursor-pointer" />
                    {seen ? <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary3 animate-pulse" /> : ''}
                    <div ref={notiRef} className="hidden absolute z-50 w-72 max-w-[calc(100vw-2rem)] right-0 top-full mt-3 bg-white shadow-c3xl rounded-xl pb-2">
                        <Notification notStocks={notStocks} />
                    </div>
                </div>
            </div>
        </nav>
    );
}
