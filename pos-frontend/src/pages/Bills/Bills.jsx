import React, { useEffect, useState } from 'react';
import RefundModal from './RefundModal';
import useFetch from '@/utils/hooks/useFetch';
import toast from 'react-hot-toast';
import Paginate from '@/components/Shared/Paginate/Paginate';
import { SortIcon } from "@/assets/SvgComponents";
import PrintIcon from '../../assets/Icons/print.svg?react'
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';



const TABLE_HEAD = ['id', 'Invoice ID', 'Customer Name', 'Cashier Name', 'Products', 'Date', 'Items', 'Discount', 'Tax', 'Total', 'Action']

const Refund = () => {
  const [data, setData] = useState({});
  const [modal, setModal] = useState(null);
  const { get } = useFetch();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const currency = useSelector((state) => state.storeStore?.store?.currency || { symbol: "$" });
  const canRefund = useSelector((state) => state.authStore.user?.role) === 'admin';
  const fetchData = () => {
    get(`/sales?page=${page}&sortBy=createdAt:${filter === true ? 'asc' : 'desc'}&search=${search}`).then(res => {
      res?.status === 200 ? setData(res?.data) : toast.error(res.message)
    }).catch(error => console.log(error));

  }
  useEffect(() => {
    fetchData();

  }, [page, filter, search])

  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} , ${date.getFullYear()}`
  }

  const handleSuccess = () => {
    fetchData();
  }
  const getName = (items) => {
    if (items.length >= 2) {
      let name = "";
      items.map(({ item }, idx) => {
        if (idx < 3) {
          const words = item.name.split(" ");
          name = name.concat((name.length > 0 ? ' , ' : '') + words[0]);
        }
      })
      return items.length > 2 ? name.concat('+') : name;
    }
    return items[0].item.name;
  }
  const getPer = (item) => {
    // item?.totalDiscount.toFixed(2)
    // console.log(item);
    return (item?.totalDiscount + item?.flatDiscount).toFixed(2);
  }

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);

  }
  const handlePrint = ({ id }) => {
    const found = data?.docs?.find((e) => e.id === id);
    if (!found) return toast.error("Something went wrong");
    navigate(`/bill-print`, {
      state: { receiptData: found }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h1 className="text-lg font-semibold text-primary">Bills</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input onChange={(ev) => handleSearch(ev.target.value)} className="flex-1 sm:w-64 h-9 rounded-full border border-border px-3 text-sm text-primary outline-none focus:border-primary4" placeholder="Search bills" type="search" />
          <button type="button" title="Sort by date" aria-label="Sort by date" onClick={() => setFilter((prev) => !prev)} className="h-9 w-9 shrink-0 grid place-items-center border border-border rounded-lg hover:bg-light active:scale-95">
            <SortIcon />
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="rt bg-white table-auto min-w-full">
          <thead>
            <tr className="border-y border-border">
              {TABLE_HEAD.map((item, index) => <th className="text-xs text-left font-semibold text-primary py-2 px-3 whitespace-nowrap" key={index}>{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {
              data?.docs?.map((item, index) => <tr key={index} className="border-b border-border hover:bg-light cursor-default">
                <td data-label="id" className="text-sm py-2 px-3 whitespace-nowrap">{item?.id}</td>
                <td data-label="Invoice ID" className="text-sm py-2 px-3 whitespace-nowrap">{item?.invoiceId}</td>
                <td data-label="Customer" className="text-sm py-2 px-3 whitespace-nowrap">{item?.customerName}</td>
                <td data-label="Cashier" className="text-sm py-2 px-3 whitespace-nowrap">{item?.cashier?.fullName}</td>
                <td data-label="Products" className="text-sm py-2 px-3 truncate max-w-[10rem] lg:max-w-xs">{getName(item?.products)}</td>
                <td data-label="Date" className="text-sm py-2 px-3 whitespace-nowrap">{formatDate(item?.createdAt)}</td>
                <td data-label="Items" className="text-sm py-2 px-3 whitespace-nowrap">{item?.products.reduce((sum, currentObject) => sum + currentObject.quantity, 0)}</td>
                <td data-label="Discount" className="text-sm py-2 px-3 whitespace-nowrap">{`${currency.symbol} ${getPer(item)}`}</td>
                <td data-label="Tax" className="text-sm py-2 px-3 whitespace-nowrap">{`${currency.symbol} ${item?.totalTax.toFixed(2)}`}</td>
                <td data-label="Total" className="text-sm py-2 px-3 whitespace-nowrap font-semibold">{`${currency.symbol} ${item?.subTotal.toFixed(2)}`}</td>
                <td className="text-sm py-2 px-3">
                  <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                    {canRefund && <button className="bg-primary2 text-white text-xs font-semibold rounded-full py-1 px-3 hover:opacity-90 active:scale-95" onClick={() => setModal(item)}>Refund</button>}
                    <button type="button" title="Print" aria-label="Print" onClick={() => handlePrint(item)} className="p-1 rounded hover:bg-light"><PrintIcon className="stroke-primary hover:stroke-primary3 cursor-pointer" /></button>
                  </div>
                </td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
      {
        data?.docs?.length > 0
          ? <Paginate data={data} callback={setPage} />
          : <div className="text-center text-sm text-label py-8">{data?.docs ? 'No bills found' : 'Loading...'}</div>
      }
      {
        modal ? <RefundModal modal={modal} setModal={setModal} handleSuccess={handleSuccess} /> : ''
      }
    </div>
  );
};

export default Refund;