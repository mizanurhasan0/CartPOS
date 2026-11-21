import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown } from '@/components';
import StatCard from '@/feature/Dashboard/components/StatCard';
import { DollarIcon, Plus, ProfitIcon, ReceivedIcon, SortIcon, SpendIcon } from '@/assets/SvgComponents';
import Input from '@/components/Shared/Inputs/Input';
import Paginate from '@/components/Shared/Paginate/Paginate';
import useFetch from '@/utils/hooks/useFetch';
import { setAccountsData } from '@/store/Reducer/AccountSlice';
import { useNavigate } from 'react-router';
import MoneyReceivedChart from './MoneyReceivedChart';
import MoneySpendChart from './MoneySpendChart';

const TABLE_HEAD = [
  '_id', 'ID', 'Product Name', 'Purpose', 'Quantity', 'Cost/Unit', 'Total', 'Outcome', 'Date'
];
const FILTER_OPTIONS = [
  { id: 1, name: 'All', value: 'all' },
  { id: 2, name: 'Sell', value: 'sell' },
  { id: 3, name: 'Restock', value: 'restock' },
  { id: 4, name: 'Expense', value: 'expense' },
  { id: 5, name: 'Others', value: 'others' },
]


const Accounts = () => {
  const { user } = useSelector(state => state.authStore);
  const { data, page, sort, status, search, stats } = useSelector(state => state.accountsStore);
  const { get } = useFetch();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} , ${date.getFullYear()}`
  }
  const fetchData = () => {
    //change endpoint to your end point

    get(`/history?${status !== 'all' ? 'purpose=' + status + '&' : ''}&page=${page}&sortBy=${sort === true ? 'createdAt:asc' : 'createdAt:desc'}&search=${search}`).then(res => {
      if (res?.status === 200) {
        dispatch(setAccountsData({ target: 'data', value: res?.data }))

      }
    }).catch(error => console.log(error));

  }

  useEffect(() => {
    fetchData();

  }, [page, sort, search, status]);

  useEffect(() => {
    if (user) {
      get(`/history/${user?.store?.id}`).then(res => {
        if (res?.status === 200) {
          dispatch(setAccountsData({ target: 'stats', value: res?.data }));
        }
      }).catch(error => console.log(error));
    }

  }, [user])

  return (
    <div className='w-full space-y-3'>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className='text-lg font-semibold text-primary'>Accounts</h1>
        <Button className="flex items-center justify-center" style="small" onClick={() => navigate('add-new-cost')}>
          <Plus className="mr-2" />
          Add New Cost
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard amount={stats?.totalTransection || 0} title='Total Transaction' type='currency' icon={<DollarIcon />} />
        <StatCard amount={stats?.totalRevenue || 0} title='Money received' type='currency' icon={<ReceivedIcon />} />
        <StatCard amount={stats?.totalExpense || 0} title='Money Spend' type='currency' icon={<SpendIcon />} />
        <StatCard amount={stats?.netProfit || 0} title='Net Profit' type='currency' icon={<ProfitIcon />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <MoneyReceivedChart />
        <MoneySpendChart />
      </div>

      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Dropdown defaultValue={{ id: 1, name: 'All', value: 'all' }} data={FILTER_OPTIONS} label='' className='w-fit' modalClass='w-full sm:w-fit whitespace-nowrap' onChange={(e) => dispatch(setAccountsData({ target: 'status', value: e.value }))} />
        <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end min-w-[10rem]">
          <div className="flex-1 sm:w-48 sm:flex-none">
            <Input style='secondary' className='w-full' placeholder='search...' type='search' label='hello world' size='md' onChange={(e) => dispatch(setAccountsData({ target: 'search', value: e.target.value }))} />
          </div>
          <div
            onClick={() => dispatch(setAccountsData({ target: 'sort', value: !sort }))}
            className="p-2 border border-gray2 rounded-lg cursor-pointer w-fit">
            <SortIcon />
          </div>
        </div>
      </div>

      {/* Main Table */}

      <div className="w-full overflow-x-auto rounded-xl border border-border bg-white">
        <table className='bg-white table-auto min-w-full text-sm'>
          <thead>
            <tr className='border-y border-border'>
              {TABLE_HEAD.map((item, index) => <th className='text-xs text-left font-semibold text-primary py-2 px-3 whitespace-nowrap tracking-wider' key={index}>{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {
              data?.docs?.map((item, index) => <tr key={index} className='border-t border-border hover:bg-light cursor-default' >
                <td className={` py-2 px-3 whitespace-nowrap`}> {item?.id}</td>
                <td className={` py-2 px-3 whitespace-nowrap `}># {String(item?.uid).padStart(4, '0')}</td>
                <td className={` py-2 px-3 whitespace-nowrap truncate max-w-xs`}> {item?.name}</td>
                <td className={` py-2 px-3 whitespace-nowrap first-letter:uppercase ${item?.type === 'revenue' ? 'text-primary3' : 'text-[#AF2626]'}`}> {item?.purpose}</td>
                <td className={` py-2 px-3 whitespace-nowrap w-[6.25rem]`}>{item?.quantity}</td>
                <td className={` py-2 px-3 whitespace-nowrap `}>{item?.cost?.toFixed(2)}</td>
                <td className={` py-2 px-3 whitespace-nowrap w-[6.25rem] ${item?.type === 'revenue' ? 'text-primary3' : 'text-[#AF2626]'}`}> {item?.type === 'revenue' ? '+' : '-'} {item?.total?.toFixed(2)}</td>
                <td className={` py-2 px-3 whitespace-nowrap w-[6.25rem] first-letter:uppercase ${item?.type === 'revenue' ? 'text-primary3' : 'text-[#AF2626]'}`}>{(item?.type)}</td>
                <td className={` py-2 px-3 whitespace-nowrap w-[6.25rem]`}>{formatDate(item?.createdAt)}</td>
              </tr>)
            }
          </tbody>
        </table>
        {
          data?.docs?.length > 0 ? <>
            <Paginate data={data} callback={(e) => { dispatch(setAccountsData({ target: 'page', value: e })) }} />
          </> : <div className='text-center text-sm text-label py-6'>No Data Found</div>
        }
      </div>
    </div>
  );
};

export default Accounts;