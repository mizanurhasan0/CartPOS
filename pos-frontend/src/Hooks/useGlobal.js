import { setProductCategory } from '@/store/Reducer/inventotySlice';
import { addStock, setSeen } from '@/store/Reducer/notificationSlice';
import { setAdminList, setStore, setuPaginate } from '@/store/Reducer/userSlice';
import useFetch from '@/utils/hooks/useFetch';
import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_APP_SOCKET_URL || 'http://localhost:4002', {
    withCredentials: true,
    autoConnect: false,
});
const socketEvent = ['stockOut', 'lowStock', 'newUser', 'newItem'];

export default function useGlobal() {
    const { status, sort } = useSelector((state) => state.userStore.filter, shallowEqual);
    const dispatch = useDispatch();
    const { get, post } = useFetch();
    const [waiting, setWaiting] = useState(false);
    

    const getStores = ({ page = 1 }) => {
        setWaiting(true);
        get(`/store?page=${page}`).then((res) => {
            if (res.status === 200) {
                const { totalPages, nextPage, prevPage, page, docs, totalDocs } = res.data;
                const d = docs.map((m) => ({ id: m.id, name: m.name, value: m.id }));
                dispatch(setStore(d));
                dispatch(setuPaginate({ name: 'store', totalPages: totalPages, current: page, nextPage: nextPage, prevPage: prevPage, totalDocs: totalDocs }));
            }
        }).catch((e) => console.log(e)).finally(() => setWaiting(false));
    }
    // 
    const getAllUsers = ({ page = 1 }) => {
        setWaiting(true);
        let url = (status === undefined) ? `/user?page=${page}${sort ? '&sortBy=createdAt' : ''}` : `/user?status=${status}&page=${page}${sort ? '&sortBy=createdAt' : ''}`
        get(url).then(({ data, status }) => {
            if (status === 200) {
                const dt = data.docs.map((m) => ({ _id: m.id, id: m.userId, name: m.fullName, store: m?.store?.name || 'Empty', role: m.role, email: m.email, status: m.status ? 'active' : 'deactive', }));
                dispatch(setAdminList({ ...data, docs: dt }));
            }
        }).catch((e) => console.log(e)).finally(() => setWaiting(false));
    }

    // Set Notification event in redux
    const setNotification = (item, date, action, msg) => {
        dispatch((update, state) => {
            const { setting } = state().authStore.user;
            if (setting[action]) {
                update(addStock(JSON.parse(JSON.stringify({ item: item.item, date: date, msg: msg }))));
                update(setSeen(true));
            }
        })
    }
    // Product Categories
    const getProductCategory = () => {
        get(`/category`).then((res) => {
            if (res.status === 200) dispatch(setProductCategory(res.data));
        }).catch(error => console.log(error))
    };
    useEffect(() => {
        getAllUsers({ page: 1 });
    }, [status, sort]);

    // loged out all users in a store
    const loggedOutUser = () => {
        post(`/user/logout`).then((res) => { 
            res.status === 200 ? window.location.replace('/auth') : '';
        }).catch(err => console.log('error', err));
    }

    useEffect(() => {
        socketEvent.map((e) => socket.off(e));
        socket.on('stockOut', ({ item, date }) => setNotification(item, date, 'stockOut', 'out of stock'));
        socket.on('lowStock', ({ item, date }) => setNotification(item, date, 'lowStock', 'low stock'));
        socket.on('newUser', ({ item, date }) => setNotification(item, date, 'newUser', 'new user'));
        socket.on('newItem', ({ item, date }) => setNotification(item, date, 'newItem', 'new item'));
        socket.on('resetStore', () => loggedOutUser());

        return () => socketEvent.map((e) => socket.off(e));

    }, []);
    return {
        socket,
        getStores,
        getAllUsers,
        getProductCategory,
        // States
        waiting,
        setWaiting,
    }
}
