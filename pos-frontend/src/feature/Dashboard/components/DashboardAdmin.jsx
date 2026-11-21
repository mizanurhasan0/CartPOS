import { AnnaualProfit, CartBlue, CartGreen, DailyProfitCart, IdealCart, InventoryRestock, SortIcon, StockOutCart, TotalCart } from '@/assets/SvgComponents';
import { Button, Table } from '@/components';
import StatCard from './StatCard';
import ReloadIcon from '@/assets/Icons/reload.svg?react';
import loader from '@/assets/Icons/loader.png';
import Input from '@/components/Shared/Inputs/Input';
import Graph from '@/pages/Dashboard/AreaChart';
import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFetch from '@/utils/hooks/useFetch';
import { setStoreDetails, setValue } from '@/store/Reducer/storeSlice';
import toast from 'react-hot-toast';
import { Arwlfcle } from "@/assets/SvgComponents";
import { formatDate } from '@/utils/helpers/dateFormatter';

export default function DashboardAdmin() {
  const { user, type, data, store, stat } = useSelector((state) => ({
    user: state.authStore.user,
    data: state.storeStore.storeDetails.data,
    type: state.storeStore.storeDetails.type,
    store: state.storeStore.store,
    stat: state.storeStore.adminStatistics,
  }), shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { get } = useFetch();
  const { id } = useParams();
  // const [store, setStore] = useState(null);
  const [filter, setFilter] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);
  const [target, setTarget] = useState('');
  const storeId = user.role === 'admin' ? (store ? store?.id : '') : id;


  function changeType(type) {
    dispatch(setStoreDetails({ target: 'type', value: type }))
    setFilter(null);
  }

  useEffect(() => {
    const part = type === 'items' ? 'product' : type === 'sales' ? 'sales' : type === 'bills' ? 'sales' : type === 'history' ? 'history' : '';
    if (part === '') return;
    get(`/${part}?page=1&store=${storeId}${filter ? '&' + filter.name + '=' + filter.value : ''}${(type === 'items' && !filter) ? '&sortBy=stock:desc' : ''}`)
      .then((res) => {
        if (res.data) return dispatch(setStoreDetails({ target: 'data', value: res.data.docs }));
        return toast.error(res.message);
      }).catch(error => console.error(error));
  }, [type, filter]);

  useEffect(() => {
    if (user.role === 'superadmin') {
      get(`/admin/reports?store=${storeId}`)
        .then(({ data }) => {
          if (data) setShouldReload(false);
          dispatch(setValue({ target: 'adminStatistics', value: data }));
          setTarget('');
        })
        .catch((err) => console.log(err));
    } else {
      get(`/admin/reports`)
        .then(({ data }) => {
          if (data) setShouldReload(false);
          dispatch(setValue({ target: 'adminStatistics', value: data }));
          setTarget('');
        })
        .catch((err) => console.log(err));
    }

  }, [shouldReload])


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
  let debounceTimeout;
  function onFilter(ev) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const text = ev.target.value;
      text ? setFilter({ name: 'search', value: text }) : setFilter(null);
    }, 500);
  }
  const handleDashboardReload = () => {
    setShouldReload(true)
  }
  const sortClick = () => setFilter((prev) => {
    if (prev) return null;
    return { name: 'sortBy', value: type === 'items' ? 'stock' : 'createdAt' }
  });
  const dotColors = ['bg-primary', 'bg-primary1', 'bg-primary2', 'bg-primary3', 'bg-primary5'];
  const Section = ({ title, name, children }) => (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-primary2">{title}</p>
        <button type="button" aria-label="Reload" className="p-1 -m-1" onClick={() => { handleDashboardReload(); setTarget(name); }}>
          <ReloadIcon className="stroke-primary4 w-4 h-4" />
        </button>
      </div>
      {shouldReload && target === name ? (
        <div className="flex justify-center py-4"><img className="w-8 h-8 clockwise" src={loader} alt="" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">{children}</div>
      )}
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-3 min-w-0">
          {user.role === 'superadmin' && (
            <Button onClick={() => navigate(-1)} style='small' className=''>
              <div className="flex items-center gap-2">
                <Arwlfcle className='stroke-white' />
                <span>Back</span>
              </div>
            </Button>
          )}
          <h1 className="text-lg font-semibold text-primary truncate">{store?.name || 'Dashboard'}</h1>
        </div>
        {store?.address && <p className="text-xs text-label truncate max-w-full">{store.address}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Section title="Sales Overview" name="sales">
          <StatCard bare type='currency' amount={stat?.yearlySales} title='Annual Sales' icon={<CartGreen />} />
          <StatCard bare type='currency' amount={stat?.yearlyProfit} title='Annual Profit' icon={<AnnaualProfit />} />
          <StatCard bare type='currency' amount={stat?.dailySales} title='Daily Sales' icon={<CartBlue />} />
          <StatCard bare type='currency' amount={stat?.dailyProfit} title='Daily Profit' icon={<DailyProfitCart />} />
        </Section>
        <Section title="Purchase Information" name="purchase">
          <StatCard bare amount={stat?.restockProducts} title='Inventory Restock' icon={<InventoryRestock />} />
          <StatCard bare amount={stat?.stockOutProducts} title='Stock out items' icon={<StockOutCart />} />
          <StatCard bare amount={0} title='Ideal Item' icon={<IdealCart />} />
          <StatCard bare amount={stat?.totalItems} title='Total Items' icon={<TotalCart />} />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
        <div className="lg:col-span-3 min-w-0"><Graph /></div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-sm font-semibold text-primary2 mb-2">Top Items</p>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {stat?.topSellingProducts?.length ? stat.topSellingProducts.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${dotColors[Math.min(index, 4)]}`}></span>
                <p className="text-sm truncate">{item.name}</p>
              </div>
            )) : <p className="text-xs text-label">No data yet</p>}
          </div>
        </div>
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
            <div onClick={sortClick} className="cursor-pointer p-2 border border-gray2 rounded-lg">
              <SortIcon />
            </div>
          </div>
        </div>
        <Table role={user.role === 'superadmin' ? "superAdmin" : "admin"} paginate={false} type={type} data={formateData(data)} />
        <div className="flex justify-end">
          <button onClick={() => navigate(`/store-details/${storeId}`)} className="mt-2 font-semibold text-sm text-primary1 cursor-pointer">Show More</button>
        </div>
      </div>
    </div>
  );
}
