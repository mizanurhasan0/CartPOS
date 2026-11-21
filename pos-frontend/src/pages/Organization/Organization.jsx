import { Delete, Plus, SortIcon } from '@/assets/SvgComponents';
import { Button, Dropdown, Modal, Table } from '@/components';
import React, { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Input from '@/components/Shared/Inputs/Input';
import useFetch from '@/utils/hooks/useFetch';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/helpers/dateFormatter';
import Paginate from '@/components/Shared/Paginate/Paginate';
import { useDispatch, useSelector } from 'react-redux';
import { setuPaginate } from '@/store/Reducer/userSlice';
import { setValue } from '@/store/Reducer/storeSlice';

const dataMaker = (res) => {
    const data = res.data?.docs.map(item => {
        return (
            {
                _id: item?.id,
                id: item?.storeId,
                organization: item?.name,
                owner: item?.owner?.fullName,
                email: item?.owner?.email,
                // password: item?.owner?.password,
                registration: formatDate(item?.createdAt),
                status: item?.status,
            }
        )
    })
    delete res?.data?.docs;
    const response = {
        docs: data,
        ...res?.data
    }
    return response
}
const Organization = () => {
    const dispatch = useDispatch();
    const [organizationTable, setOrganizationTable] = useState({ docs: [] });
    const [stores, setStores] = useState([]);
    const [sort, setSort] = useState(false);
    const [modal, setModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const navigate = useNavigate();
    const { get, deleteApi } = useFetch();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const { user } = useSelector((state) => ({
        user: state.authStore.user,
    }));

    const fetchHandler = () => {
        get(`/store${page ? '?page=' + page : ''}${sort ? '&sortBy=createdAt:asc' : '&sortBy=createdAt:desc'}${filter !== 'all' ? `&status=${filter}` : ''}`)
            .then((res) => {
                if (res) {
                    const { totalPages, nextPage, prevPage, totalDocs, page } = res.data;
                    setStores(res.data.docs);
                    const response = dataMaker(res);
                    setOrganizationTable(response);
                    dispatch(setuPaginate({ name: 'store', totalPages: totalPages, current: page, nextPage: nextPage, prevPage: prevPage, totalDocs: totalDocs }));
                }
            })
            .catch(error => toast.error(error.message));
    }

    useLayoutEffect(() => {
        fetchHandler();
    }, [filter, sort, page])

    // Reset Logged users
    const resetHandler = (id) =>{
        get(`/reset/store/${id}`).then((res) => res.status === 200 ? toast.success(res.data) : '').catch((err) => toast.error(err));

    }

    const searchHandler = (e) => {
        const key = e.target.value;
        get(`/store?search=${key}`)
            .then(res => {
                setStores(res.data.docs);
                const response = dataMaker(res)
                setOrganizationTable(response);
            })
            .catch(error => toast.error(error.message));
    }

    const deleteHandler = (data) => {
        setDeleteItem(data);
        setModal(true);

    }
    const modalConfirm = () => {
        deleteApi(`/store/${deleteItem?._id}`)
            .then(res => {
                if (res.status === 200) {
                    toast.success('Deleted Successfully')
                    get('/store')
                        .then(res => {
                            setStores(res.data.docs);
                            const response = dataMaker(res)
                            setOrganizationTable(response);
                        })
                        .catch(error => toast.error(error.message));
                }
            })
            .catch(error => toast.error(error.message + "hello")).finally(() => setModal(false));
    }
    const handleEdit = (id) => {
        navigate(`/organization/${id?._id}`);
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h1 className="text-lg font-semibold text-primary">Organizations</h1>
                <Button onClick={() => navigate('/organization/create')} style='small' className=''>
                    <div className="flex items-center justify-center gap-2">
                        <Plus /> <span>Create</span>
                    </div>
                </Button>
            </div>
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Dropdown defaultValue={{ id: 3, name: "All", value: 'all' }} data={[{ id: 3, name: "All", value: 'all' }, { id: 1, name: 'Active', value: 'active' }, { id: 2, name: 'Deactive', value: 'deactive' }]} onChange={(e) => { setFilter(e?.value) }} className='w-fit' modalClass="w-full sm:w-fit whitespace-nowrap" label='' />
                    <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end min-w-[10rem]">
                        <div className="flex-1 sm:w-56 sm:flex-none">
                            <Input onChange={searchHandler} className="border-light w-full" style='secondary' placeholder='search...' type='search' label='hello world' size='md' />
                        </div>
                        <div onClick={() => setSort(!sort)} className="p-2 border border-light rounded-lg cursor-pointer">
                            <SortIcon />
                        </div>
                    </div>
                </div>

                <Table type={'organization'} data={organizationTable?.docs} Edit={handleEdit} Delete={deleteHandler} onClick={(e) => {
                    let store = stores.find((ech) => ech.id === e._id);
                    if (!store) return toast.error('Something went wrong');
                    dispatch(setValue({ target: 'store', value: store }));
                    navigate(`/store/${e._id}`);
                }}
            reset={(id) => resetHandler(id)} />
                {organizationTable.docs.length !== 0 ? <Paginate data={organizationTable} callback={(e) => setPage(e)} /> : <p className="text-center text-sm text-label py-6">No organizations found</p>}

            </div>
            {/* Modal */}
            <Modal show={modal} onClose={() => setModal(false)}>
                <div className="grid gap-6">
                    <div className="flex gap-6 items-start -mt-10 max-w-[90%]">
                        <div className="flex items-center justify-center relative">
                            <div className="bg-[#fcd1d8] w-[3rem] h-[3rem] p-2 rounded-full">
                                <div className="bg-[#faafaf] w-[2rem] h-[2rem] p-1 rounded-full">
                                    <Delete className="stroke-danger h-6 w-6" />
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <p className="text-danger font-semibold font-nunito">Remove</p>
                            <p className="text-primary text-base ">Are you sure you want to remove this item? This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button style='outline' onClick={() => setModal(false)}>Cancel</Button>
                        <Button style='custom' className='bg-[#AF2626] text-white py-2 px-4 ' onClick={modalConfirm}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
};
export default Organization;
