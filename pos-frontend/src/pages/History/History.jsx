import { ArrowDown, SortIcon } from "@/assets/SvgComponents";
import Input from "@/components/Shared/Inputs/Input";
import { setStoreHistory } from "@/store/Reducer/storeSlice";
import { formatDate } from "@/utils/helpers/dateFormatter";
import useFetch from "@/utils/hooks/useFetch";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const TABLE_HEAD = [
    '_id', 'ID', 'Product Name', 'Purpose', 'Quantity', 'Cost/Unit', 'Total', 'Outcome', 'Date'
];

export default function History() {
    const { data, page, type, prev, next, totalDocs } = useSelector((state) => ({
        data: state.storeStore.history.data,
        page: state.storeStore.history.page,
        next: state.storeStore.history.next,
        prev: state.storeStore.history.prev,
        type: state.storeStore.history.type,
        totalDocs: state.storeStore.history.totalDocs
    }));
    const { get } = useFetch();
    const dispatch = useDispatch();
    const [filter, setFilter] = useState();
    const [period, setPeriod] = useState('today');

    useEffect(() => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        let start = new Date();
        if (period === 'today') {
            start.setHours(0, 0, 0, 0);
        } else if (period === 'week') {
            start.setDate(end.getDate() - end.getDay() - 6);
            start.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

        } else if (period === 'year') {
            start = new Date(end.getFullYear(), 0, 1, 0, 0, 0, 0);
        }

        const startISOString = start.toISOString();
        const endISOString = end.toISOString();
        const filterValue = `{"$gte":"${startISOString}","$lte":"${endISOString}"}`;

        get(`/history?page=${page}&limit=10${filter ? '&' + filter.name + '=' + filter.value : ''}&createdAt=${filterValue}`)
            .then((res) => {
                console.log(res)
                dispatch(setStoreHistory({ target: 'data', value: res.data.docs }));
                dispatch(setStoreHistory({ target: 'totalDocs', value: res.data.totalDocs }));
                dispatch(setStoreHistory({ target: 'next', value: res.data.nextPage }));
                dispatch(setStoreHistory({ target: 'prev', value: res.data.prevPage }));
            })
            .catch((e) => console.log(e))
    }, [page, filter, period]);


    function changeType(type) {
        dispatch(setStoreHistory({ target: 'type', value: type }));
        setPeriod(type);
    }

    function changePage(num) {
        dispatch(setStoreHistory({ target: 'page', value: num }));
    }
    let debounceTimeout;
    function onFilter(ev) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const text = ev.target.value;
            text ? setFilter({ name: 'search', value: text }) : setFilter(null);
        }, 500);
    }
    const cell = 'py-2 px-3 whitespace-nowrap';
    return (
        <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-lg font-semibold text-primary mr-2">History</h1>
                <ul className="flex gap-1 order-3 sm:order-none w-full sm:w-auto">
                    {['today', 'week', 'month', 'year'].map((t) => (
                        <li key={t} onClick={() => changeType(t)} className={`font-semibold text-xs capitalize rounded-full px-3 py-1.5 cursor-pointer transition active:scale-95 ${type === t ? 'bg-primary1 text-white' : 'text-primary1 border border-border hover:bg-light'}`}>{t}</li>
                    ))}
                </ul>
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto sm:min-w-[16rem]">
                    <Input onChange={(ev) => onFilter(ev)} className="w-full" style='secondary' placeholder='Search...' type='search' size='sm' />
                    <button
                        type="button"
                        title="Sort"
                        onClick={() => setFilter((prev) => {
                            if (prev) return null;
                            return { name: 'sortBy', value: 'createdAt:asc' }
                        })}
                        className="h-9 w-9 shrink-0 flex items-center justify-center border border-gray2 rounded-lg hover:bg-light active:scale-95">
                        <SortIcon />
                    </button>
                </div>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-border">
                <table className='bg-white table-auto min-w-full text-sm'>
                    <thead>
                        <tr className='border-b border-border bg-light'>
                            {TABLE_HEAD.map((item, index) => <th className='text-xs text-left font-semibold text-primary py-2 px-3 whitespace-nowrap tracking-wider' key={index}>{item}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.length > 0 ? data?.map((item, index) => <tr key={index} className='border-t border-border hover:bg-light cursor-default'>
                                <td className={cell}>{item?.id}</td>
                                <td className={cell}># {String(item?.uid).padStart(4, '0')}</td>
                                <td className={`${cell} truncate max-w-[10rem] lg:max-w-xs`} title={item?.name}>{item?.name}</td>
                                <td className={`${cell} first-letter:uppercase ${item?.type === 'revenue' ? 'text-primary3' : 'text-[#AF2626]'}`}>{item?.purpose}</td>
                                <td className={cell}>{item?.quantity} {item?.unit}</td>
                                <td className={cell}>{item?.cost?.toFixed(2)}</td>
                                <td className={`${cell} ${item?.type === 'revenue' ? 'text-primary3' : 'text-[#AF2626]'}`}>{item?.type === 'revenue' ? '+' : '-'} {item?.total?.toFixed(2)}</td>
                                <td className={`${cell} first-letter:uppercase ${item?.type === 'revenue' ? 'text-primary3' : 'text-[#AF2626]'}`}>{(item?.type)}</td>
                                <td className={cell}>{formatDate(item?.createdAt)}</td>
                            </tr>)
                                :
                                <tr>
                                    <td className="py-6 px-3 text-center text-sm text-label" colSpan={TABLE_HEAD.length}>No history for this period</td>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-3">
                <p className="text-xs font-semibold text-gray">Showing {totalDocs > 0 ? totalDocs >= page * 10 ? page * 10 : totalDocs : 0} of {totalDocs}</p>
                <div className="flex items-center gap-3">
                    <button onClick={() => changePage(prev)} disabled={prev === null} className="disabled:opacity-40 active:scale-95">
                        <ArrowDown className='stroke-white bg-primary1 rounded-full h-7 w-7 rotate-90' />
                    </button>
                    <button onClick={() => changePage(next)} disabled={next === null} className="disabled:opacity-40 active:scale-95">
                        <ArrowDown className='stroke-white bg-primary1 rounded-full h-7 w-7 -rotate-90' />
                    </button>
                </div>
            </div>
        </div>
    )
}
