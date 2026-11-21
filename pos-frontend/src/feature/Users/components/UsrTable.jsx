import { CartBlue, Plus, SortIcon, TotalUsers } from '@/assets/SvgComponents';
import { Button, Dropdown, Table } from '@/components';
import Input from '@/components/Shared/Inputs/Input';
// import { dropdownData } from '@/db/UserData'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Paginate from '@/components/Shared/Paginate/Paginate';
import Loading from '@/pages/Loading/Landing';
import { useGlobalCtx } from '@/Context/GlobalProvider';
import { setFilter } from '@/store/Reducer/userSlice';
import DeleteModal from './DeleteModal';


export default function UsrTable() {
    const navigator = useNavigate();
    const dispatch = useDispatch();
    const { getAllUsers, onDeleteAdmin, searchHandler, loading, waiting } = useGlobalCtx();
    const { usrAdmins, filter, uPaginate: { store } } = useSelector((state) => state.userStore, shallowEqual);
    const { user } = useSelector((state) => state.authStore, shallowEqual);

    const [dltId, setDltId] = useState({ modal: false, id: null });

    const onEdit = (data) => navigator(`/users/${data._id}`);

    const onSort = ({ name, value }) => {
        const oldFilt = { ...filter, [name]: value };
        dispatch(setFilter(oldFilt));
    };

    if (loading) return <Loading />;

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-lg font-semibold text-primary mr-1">Users</h1>
                {user?.role === 'superadmin' ? <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-label"><CartBlue className="h-4 w-4" />Stores <b className="text-sm text-primary">{store?.totalDocs ?? 0}</b></span> : ''}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-label"><TotalUsers className="h-4 w-4" />Total <b className="text-sm text-primary">{usrAdmins?.totalDocs ?? 0}</b></span>
                <Button className="flex items-center justify-center ml-auto !py-1.5 !px-4 !text-sm" style="secondary" onClick={() => navigator('/users/create')}>
                    <Plus className="mr-1" />
                    Create New User
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <Input style='secondary' onChange={searchHandler} placeholder='Search...' type='search' size='sm' className="w-full sm:w-64" />
                <Dropdown defaultValue={{ id: 0, name: "All", value: undefined }} data={[{ id: 0, name: 'All', value: undefined }, { id: 1, name: 'Active', value: true }, { id: 2, name: 'Deactive', value: false }]} label='' className='w-fit' modalClass='w-full whitespace-nowrap sm:w-fit' onChange={({ value }) => onSort({ name: 'status', value: value })} />
                <button type="button" title="Sort" onClick={() => onSort({ name: 'sort', value: !filter.sort })} className={`h-9 w-9 flex items-center justify-center border border-gray2 rounded-lg hover:bg-light active:scale-95 ${filter.sort ? 'bg-[#dddddd59]' : ''}`}>
                    <SortIcon />
                </button>
            </div>

            <Table role='superAdmin' type={'users'} data={usrAdmins.docs} Edit={(data) => onEdit(data)} Delete={({ _id }) => {
                setDltId({ id: _id, modal: true });
            }} />
            <Paginate data={usrAdmins} callback={(pageNumber) => getAllUsers({ page: pageNumber })} />
            {waiting ? <div className="absolute top-0 left-0 right-0"> <Loading /> </div> : ''}
            <DeleteModal setModal={setDltId} modal={dltId.modal} onDelete={() => onDeleteAdmin(dltId.id, setDltId)} />
        </div >
    )
}
