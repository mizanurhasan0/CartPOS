import { Switch } from '@/components';
import useFetch from '@/utils/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../Authentication/AuthSlice';

const Notification = ({ user = null }) => {
    const dispatch = useDispatch();
    const [stockOut, setStockOut] = useState(false);
    const [lowStock, setLowStock] = useState(false);
    const [systemUpdate, setSysUpdate] = useState(false);
    const { get, patch } = useFetch();
    const handleToogle = (id, isChecked) => {
        // id==='notify'?setNotify(isChecked):
        id === 'stockOut' ? setStockOut(isChecked) :
            id === 'lowStock' ? setLowStock(isChecked) :
                id === 'systemUpdate' ? setSysUpdate(isChecked) : '';

        patch(`/settings`, { [id]: isChecked }).then(res => {
            dispatch((update, state) => {
                const olduser = state().authStore.user;
                update(setUser({ ...olduser, setting: JSON.parse(JSON.stringify(res.data)) }));
            })
            if (res?.status !== 200) toast.error(res?.message);
        }).catch(error => console.log(error));

    };

    useEffect(() => {
        if (user) {
            get('/settings').then(res => {
                if (res?.status === 200) {
                    setLowStock(res?.data?.lowStock);
                    setStockOut(res?.data?.stockOut);
                    setSysUpdate(res?.data?.systemUpdate);
                }
            }).catch(error => console.log(error));
        }
    }, [user]);


    const rows = [['Stock Out', 'stockOut', stockOut], ['Low Stock', 'lowStock', lowStock], ['System Update', 'systemUpdate', systemUpdate]];
    return (
        <div className="rounded-xl border border-border p-3">
            <h2 className='text-sm font-semibold text-primary2 mb-1'>Notifications</h2>
            <div className="divide-y divide-border">
                {rows.map(([label, id, val]) => (
                    <div key={id} className="py-2 flex items-center justify-between gap-3 text-sm">
                        <span>{label}</span>
                        <Switch className='' id={id} defaultChecked={val} onChange={handleToogle} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notification;
