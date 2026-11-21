import { CartBlue, RevenueIcon, SortIcon, StoreIcon, TotalUsers } from '@/assets/SvgComponents';
import { Dropdown, Table } from '@/components';
import StatCard from './StatCard';
import Graph from '@/pages/Dashboard/AreaChart';
import React, { useEffect, useState } from 'react';
import Input from '@/components/Shared/Inputs/Input';
import { useDispatch, useSelector } from 'react-redux';
import useFetch from '@/utils/hooks/useFetch';
import { setValue } from '@/store/Reducer/storeSlice';
import Arrow from '../../../assets/Icons/arrow-down.svg?react'
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

export default function DashboardSuper() {
  const { user, page, next, prev, totalDocs, stores, stat } = useSelector((state) => ({
    user: state.authStore.user,
    page: state.storeStore.pagination.page,
    next: state.storeStore.pagination.next,
    prev: state.storeStore.pagination.prev,
    totalDocs: state.storeStore.pagination.totalDocs,
    totalPage: state.storeStore.pagination.totalPage,
    stores: state.storeStore.stores,
    stat: state.storeStore.statistics,
  }));
  let debounceTimeout;
  const { get } = useFetch();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    get(`/store?page=${page}&limit=10${filter ? '&' + filter.name + '=' + filter.value : ''}`)
      .then(({ data }) => {
        dispatch((update, getState) => {
          update(setValue({ target: 'stores', value: data.docs }));
          const { pagination } = getState().storeStore;
          update(setValue({
            target: 'pagination', value: {
              ...pagination,
              totalPage: data.totalPages,
              totalDocs: data.totalDocs,
              next: data.nextPage,
              prev: data.prevPage
            }
          }))
        });
      })
      .catch((err) => console.log(err));

    get(`/superadmin/reports`)
      .then(({ data }) => {
        dispatch(setValue({ target: 'statistics', value: data }));
      })
      .catch((err) => console.log(err));
  }, [page, filter]);


  function changePage(num) {
    dispatch((update, getState) => {
      const { pagination } = getState().storeStore;
      update(setValue({ target: 'pagination', value: { ...pagination, page: num } }));
    });
  }

  function onFilter(ev) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const text = ev.target.value;
      changePage(1);
      text ? setFilter({ name: 'search', value: text }) : setFilter(null);
    }, 500);
  }
  const handlefilter = (e) => {
    dispatch((update, getState) => {
      const { pagination } = getState().storeStore;
      update(setValue({ target: 'pagination', value: { ...pagination, page: 1 } }));
    });
    if (e.value === 'all') {
      return setFilter(null);
    }
    setFilter(() => ({ name: 'status', value: e.value }));
  }

  const dotColors = ['bg-primary', 'bg-primary1', 'bg-primary2', 'bg-primary3', 'bg-primary5'];
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard amount={stat?.totalStore} title='Total Store' icon={<CartBlue />} />
        <StatCard amount={stat?.activeStore} title='Active Store' icon={<StoreIcon />} />
        <StatCard amount={stat?.totalUser} title='Total Users' icon={<TotalUsers />} />
        <StatCard amount={stat?.totalRevenue} title='Total Revenue' icon={<RevenueIcon />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
        <div className="lg:col-span-3 min-w-0"><Graph /></div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-sm font-semibold text-primary2 mb-2">Top Store</p>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {stat?.topSellingStore?.length ? stat.topSellingStore.map((sellling, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${dotColors[Math.min(index, 4)]}`}></span>
                <p className="text-sm truncate">{sellling.storeName}</p>
              </div>
            )) : <p className="text-xs text-label">No data yet</p>}
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <Dropdown defaultValue={{ id: 3, name: "All", value: 'all' }} data={[{ id: 3, name: "All", value: 'all' }, { id: 1, name: 'Active', value: 'active' }, { id: 2, name: 'Deactive', value: 'deactive' }]} onChange={(e) => { handlefilter(e) }} className='w-fit' modalClass='w-full whitespace-nowrap sm:w-fit' label='' />
          <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end min-w-[10rem]">
            <div className="flex-1 sm:w-48 sm:flex-none">
              <Input onChange={(ev) => onFilter(ev)} className="border-light" style='secondary' placeholder='search...' type='search' label='hello world' size='md' />
            </div>
            <div
              onClick={() => setFilter((prev) => {
                changePage(1);
                if (prev) return null;
                return { name: 'sortBy', value: 1 }
              })}
              className="cursor-pointer p-2 border border-gray2 rounded-lg">
              <SortIcon />
            </div>
          </div>
        </div>
        <Table onClick={(data) => {
          let store = stores.find((ech) => ech.id === data._id);
          if (!store) return toast.error('Something went wrong');
          dispatch(setValue({ target: 'store', value: store }));
          navigate(`/store/${data._id}`)
        }} role='superAdmin' type={'store'} data={stores.map((ech) => ({ _id: ech.id || '', id: ech.storeId || '', storeName: ech.name || 'No name', owner: ech?.owner?.fullName || 'No owner', totalUser: ech?.users?.length || 0, status: ech.status }))} Edit={({ _id }) => navigate(`/organization/${_id}`)} />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs font-semibold text-gray">Showing {totalDocs > 0 ? totalDocs >= page * 10 ? page * 10 : totalDocs : 0} of {totalDocs} results</p>
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
  );
}
