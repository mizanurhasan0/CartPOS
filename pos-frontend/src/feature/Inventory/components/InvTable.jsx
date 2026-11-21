import { Archive, Plus, SortIcon, Stop } from '@/assets/SvgComponents';
import { Button, Dropdown, Table } from '@/components';
import Input from '@/components/Shared/Inputs/Input';
import Paginate from '@/components/Shared/Paginate/Paginate';
import { INVENTORY_FILTER_DATA } from '@/db/UserData';
import { setInventoryData } from '@/store/Reducer/inventotySlice';
import { formatDate } from '@/utils/helpers/dateFormatter';
import useFetch from '@/utils/hooks/useFetch';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import RestockModal from './RestockModal';
import toast from 'react-hot-toast';
import DeleteModal from '@/feature/Users/components/DeleteModal';
import Loading from '@/pages/Loading/Landing';

export default function InvTable() {
    const navigator = useNavigate();
    const { get, deleteApi } = useFetch();
    const dispatch = useDispatch();
    const { data, page, sort } = useSelector(state => state?.inventoryStore);
    const { user } = useSelector(state => state.authStore);
    const [search, setSearch] = useState('');
    const [filter, setfilter] = useState('all');
    const [modal, setModal] = useState(false);
    const [delModal, setDelModal] = useState({ modal: false, id: null });
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState(null);

    
    const fetchCounts = () => {
        get('/product-count').then(res => {
            if (res?.status === 200) setCounts(res.data);
        }).catch(error => console.log(error));
    }

    const fetchData = () => {
        fetchCounts();
        setLoading(true);
        get(`/product?page=${page}&sortBy=stock:${sort === true ? 'asc' : 'desc'}&search=${search}&${`${filter === 'deactive' ? 'status=deactive' : `filter=${filter}`}`}`).then(res => {
            if (res.status === 200) {
                dispatch(setInventoryData({ target: 'data', value: res?.data }));
            }
        }).catch(error => console.log(error)).finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchData();
    }, [page, sort, search, filter]);
    
    const handlePaginate = (pageNo) => {
        dispatch(setInventoryData({ target: 'page', value: pageNo }))
    }
    const handleDelete = () => {
        deleteApi(`/product/${delModal.id}`).then((res) => {
            if (res?.status === 200) {
                fetchData();
                setDelModal({ modal: false, id: null });
                toast.success('Successfully Archived');
            }
        }).catch(error => console.log(error));
    }
    const handleSuccess = () => {
        fetchData();
    }

    const handleFilter = (e) => {
        setfilter(e.value);
    }

    const available = counts?.availableProduct ?? data?.totalDocs ?? 0;
    const outOfStock = counts?.outofStock ?? 0;

    return (
        <div className="relative">
            <div className="grid grid-cols-2 gap-3 mb-3">
                <button type="button" onClick={() => handleFilter({ value: 'available' })} className="text-left rounded-xl border border-primary2 bg-[#CCF1E0] p-3 hover:brightness-95 active:scale-[0.99] transition">
                    <div className="flex items-center gap-2">
                        <span className="p-1 bg-primary2 rounded-lg shrink-0"><Archive className="h-4 w-4" /></span>
                        <span className="text-xs text-primary2">Available</span>
                    </div>
                    <p className="text-lg font-semibold text-primary2 mt-1">{available} <span className="text-xs font-normal">items</span></p>
                </button>
                <button type="button" onClick={() => handleFilter({ value: 'stockout' })} className="text-left rounded-xl border border-red bg-[#FFD9D9] p-3 hover:brightness-95 active:scale-[0.99] transition">
                    <div className="flex items-center gap-2">
                        <span className="p-1 bg-red rounded-lg shrink-0"><Stop className="h-4 w-4" /></span>
                        <span className="text-xs text-red">Out of Stock</span>
                    </div>
                    <p className="text-lg font-semibold text-red mt-1">{outOfStock} <span className="text-xs font-normal">items</span></p>
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
                <Input style='secondary' className='w-full' placeholder='Search...' type='search' size='sm' onChange={(e) => setSearch(e.target.value)} />
                <Dropdown defaultValue={{ id: 0, name: "All", value: 'all' }} data={INVENTORY_FILTER_DATA} label='' className='w-fit' modalClass='w-full sm:w-fit whitespace-nowrap' onChange={(e) => handleFilter(e)} />
                <button
                    type="button"
                    title="Sort by stock"
                    onClick={() => dispatch(setInventoryData({ target: 'sort', value: !sort }))}
                    className="h-9 w-9 flex items-center justify-center border border-gray2 rounded-lg hover:bg-light active:scale-95">
                    <SortIcon />
                </button>
                {user?.role === 'admin' && <div className="flex gap-2 ml-auto">
                    <Button className="flex items-center justify-center !py-1.5 !px-4 !text-sm !font-semibold" style="outline" onClick={() => setModal(true)}>
                        <Plus className="mr-1 [&_path]:stroke-primary" />
                        Restock
                    </Button>
                    <Button className="flex items-center justify-center !py-1.5 !px-4 !text-sm" style="secondary" onClick={() => navigator('/inventory/addnew')}>
                        <Plus className="mr-1" />
                        Add Item
                    </Button>
                </div>}
            </div>

            <Table role={user?.role || 'user'} type='inventory' data={data?.docs?.map(item => ({
                id: item?.id,
                productId: item?.productId,
                name: item?.name,
                stockDate: formatDate(item?.updatedAt),
                ...(user?.role === 'admin' ? { buyPrice: item?.buyingPrice?.toFixed(2) } : {}), // cost price is admin-only
                sellPrice: item?.sellingPrice?.toFixed(2),
                Tax: item?.store?.taxPercent + '%' || '0%',
                stock: item?.unit ? `${item?.stock} ${item?.unit}` : `${item?.stock ?? 0}`,
                status: item?.stock > 0 ? 'available' : 'stockout',

            })) || []} Edit={user?.role === 'admin' ? (e) => navigator(e.id) : false} Delete={user?.role === 'admin' ? (e) => setDelModal({ modal: true, id: e.id }) : false} />

            <Paginate data={data} callback={handlePaginate} />
            {
                modal === true ? <RestockModal setModal={setModal} handleSuccess={handleSuccess} /> : ''
            }
            <DeleteModal setModal={setDelModal} modal={delModal.modal} onDelete={handleDelete} />
            {loading ? <div className="absolute top-0 left-0 right-0"><Loading bg /></div> : ''}
        </div>
    )
}
