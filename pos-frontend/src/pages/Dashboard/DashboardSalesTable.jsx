import { Arwlfcle, SortIcon } from "@/assets/SvgComponents";
import { Button, Table } from "@/components";
import Input from "@/components/Shared/Inputs/Input";
import Arrow from '../../assets/Icons/arrow-down.svg?react'
import { setStoreDetails, setValue } from "@/store/Reducer/storeSlice";
import useFetch from "@/utils/hooks/useFetch";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { formatDate } from "@/utils/helpers/dateFormatter";

export default function DashboardSalesTable() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, type, data, page, prev, next, totalDocs } = useSelector((state) => ({
        user: state.authStore.user,
        data: state.storeStore.storeDetails.data,
        type: state.storeStore.storeDetails.type,
        page: state.storeStore.storeDetails.page,
        prev: state.storeStore.storeDetails.prev,
        next: state.storeStore.storeDetails.next,
        totalDocs: state.storeStore.storeDetails.totalDocs
    }), shallowEqual);
    const dispatch = useDispatch();
    const storeId = user.role === 'admin' ? typeof user.store === 'string' ? user.store : user.store.id : id;
    const [filter, setFilter] = useState(null);
    const [store, setStore] = useState(null);
    const { get } = useFetch();

    useEffect(() => {
        get(`/store/${storeId}`)
            .then(({ data }) => {
                if (data) return setStore(data);
                toast.error('Something went wrong');
            }).catch(error => console.log(error));
    }, [storeId]);

    useEffect(() => {
        const part = type === 'items' ? 'product' : type === 'sales' ? 'sales' : type === 'bills' ? 'sales' : type === 'history' ? 'history' : '';
        if (part === '') return;
        get(`/${part}?limit=30&page=${page}&store=${storeId}${filter ? '&' + filter.name + '=' + filter.value : ''}${(type === 'items' && !filter) ? 'sortBy=stock:desc' : ''}`)
            .then((res) => {
                if (res.data) return dispatch((update, getState) => {
                    update(setStoreDetails({ target: 'data', value: res.data.docs }));
                    const { storeDetails } = getState().storeStore;
                    update(setValue({ target: 'storeDetails', value: { ...storeDetails, next: res.data.nextPage, prev: res.data.prevPage, totalDocs: res.data.totalDocs } }))
                });
                return toast.error(res.message);
            }).catch(error => console.log(error));
    }, [type, filter, page]);

    let debounceTimeout;
    function onFilter(ev) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const text = ev.target.value;
            text && changePage(1);
            text ? setFilter({ name: 'search', value: text }) : setFilter(null);
        }, 500);
    }

    function changeType(type) {
        changePage(1);
        dispatch(setStoreDetails({ target: 'type', value: type }));
        setFilter(null);
    }

    function formateData(rawData) {
        if (type === 'items') return rawData.map((ech) => ({
            _Id: ech?.id,
            Id: ech?.productId || '',
            productName: ech?.name || 'No name',
            buyingPrice: ech?.buyingPrice?.toFixed(2) || 0,
            inStock: ech?.stock || 0,
            sellingPrice: ech?.sellingPrice?.toFixed(2) || 0,
            Tax: ech?.store?.taxPercent + '%' || 0
        }));
        else if (type === 'sales') return rawData.map((ech) => ({
            _id: ech?.id || '',
            id: ech?.salesId,
            date: formatDate(ech?.createdAt) || 'no name',
            cashier: ech?.cashier?.fullName || 'no name',
            Customer: ech?.customerName || 'no name',
            paymentMethod: ech?.paymentMethod || 'no data',
            totalPrice: ech?.subTotal?.toFixed(2) || 0
        }));
        else if (type === 'history') return rawData.map((ech) => ({
            _id: ech?.id || '',
            id: ech?.uid,
            productName: ech?.name || 'no name',
            sellingDate: formatDate(ech.createdAt) || '',
            quantity: ech?.quantity,
            sellingPrice: ech?.cost?.toFixed(2) || 0,
        }));
        else if (type === 'bills') return rawData.map((ech) => ({
            _id: ech?.id,
            id: ech?.salesId || '',
            customerName: ech?.customerName || 0,
            cashierName: ech?.cashier?.fullName || 0,
            productName: ech?.products?.[0]?.item?.name || 'no name',
            sellingDate: formatDate(ech?.createdAt),
            quantity: ech?.products?.reduce((now, trig) => now + trig.quantity, 0) || 0,
            sellingPrice: ech?.subTotal,
            discountPrice: ech?.totalDiscount || 0,
            tax: ech?.totalTax || 0,
            totalPrice: ech?.totalTax + ech?.subTotal - ech?.totalDiscount
        }));
    }

    function changePage(num) {
        dispatch((update, getState) => {
            const { storeDetails } = getState().storeStore;
            update(setValue({ target: 'storeDetails', value: { ...storeDetails, page: num } }));
        });
    }
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Button onClick={() => navigate(-1)} style='small' className=''>
                    <div className="flex items-center gap-2">
                        <Arwlfcle className='stroke-white' />
                        <span>Back</span>
                    </div>
                </Button>
                <h1 className="text-lg font-semibold text-primary truncate">{store?.name || 'Store'}</h1>
            </div>
            <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <ul className="flex gap-1">
                        {['items', 'sales', 'history'].map((t) => (
                            <li key={t} onClick={() => changeType(t)} className={`font-semibold text-sm rounded-full px-3 py-1.5 cursor-pointer capitalize ${type === t ? 'bg-primary1 text-white' : 'text-primary1 bg-light'}`}>{t}</li>
                        ))}
                    </ul>
                    <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end min-w-[10rem]">
                        <div className="flex-1 sm:w-48 sm:flex-none">
                            <Input onChange={(ev) => onFilter(ev)} className="border-light" style='secondary' placeholder='search...' type='search' label='hello world' size='md' />
                        </div>
                        <div
                            onClick={() => setFilter((prev) => {
                                if (prev) return null;
                                return { name: 'sortBy', value: type === 'items' ? 'stock:asc' : 'createdAt' }
                            })}
                            className="cursor-pointer p-2 border border-gray2 rounded-lg">
                            <SortIcon />
                        </div>
                    </div>
                </div>
                <Table role={user.role === 'superadmin' ? "superAdmin" : "admin"} paginate={false} type={type} data={formateData(data)} />
                <div className="flex justify-between items-center mt-3">
                    <p className="text-xs font-semibold text-gray">Showing {totalDocs > 0 ? totalDocs >= page * 30 ? page * 30 : totalDocs : 0} of {totalDocs} results</p>
                    <div className="flex justify-end items-center ml-auto gap-3">
                        <button onClick={() => changePage(prev)} disabled={prev === null} className="disabled:opacity-40 p-1.5">
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 rotate-90' />
                        </button>
                        <button onClick={() => changePage(next)} disabled={next === null} className="disabled:opacity-40 p-1.5">
                            <Arrow className='stroke-white bg-primary1 rounded-full h-6 w-6 -rotate-90' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
