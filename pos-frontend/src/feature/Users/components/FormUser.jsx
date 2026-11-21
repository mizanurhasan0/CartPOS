import { Button, Dropdown, FormPage, FormCard, FormGrid, FormActions } from '@/components';
import Upload from '@/components/Forms/Upload';
import Input from '@/components/Shared/Inputs/Input';
import { ErrCheck, RXEmail } from '@/feature/Authentication/authComp/Others';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
// import Loading from '@/pages/Loading/Landing';
import { useGlobalCtx } from '@/Context/GlobalProvider';
import { setAdminList, setUpdateAdmin } from '@/store/Reducer/userSlice';
import SkillTon from './SkillTon';
import CheckImgSize from '@/utils/helpers/CheckImgSize';
// import { useGlobalCtx } from '@/Context/GlobalProvider'
const statusList = [{ id: 1, name: 'Active', value: true }, { id: 2, name: 'Deactive', value: false }];

export default function FormUser() {
    const { id } = useParams();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { onCreateUser, getUserById, onUpdateUser, getStores } = useGlobalCtx();
    const { stores, usrAdmins, uPaginate } = useSelector((state) => state.userStore, shallowEqual);
    const { user } = useSelector((state) => state.authStore, shallowEqual);
    // States
    const [image, setImage] = useState(null);
    const [activeStatus, setActiveStatus] = useState(statusList[0]);
    const [store, setStore] = useState(null);
    const [onLoad, setOnLoad] = useState(false);

    const onScrollUsers = (e) => {
        e.preventDefault();
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if ((scrollHeight - scrollTop - clientHeight) <= 2) {
            if (uPaginate.store?.nextPage) getStores({ page: uPaginate.store.nextPage });
        }
    };
    useEffect(() => {
        if (id !== 'create') {
            setOnLoad(true);
            getUserById(id).then(({ data }) => {
                Object.keys(data).forEach((k) => (k !== 'image' && setValue(k, data[k])));
                setImage(data.image);
                setActiveStatus(statusList.find((s) => s.value === data.status));
                setStore(data['store']);
            }).catch(() => navigate('/users/create')).finally(() => setOnLoad(false));
        }
    }, []);
    const onSubmit = (data) => {
        try {
            setOnLoad(true);
            // if (image === null) throw new Error(toast.error('Please select an  image'));
            if (user?.role === 'superadmin' && store === null) throw new Error(toast.error('Please select organization'));
            if (id === 'create') {
                onCreateUser({ ...data, store: store, image: image, status: activeStatus.value }).then((res) => {
                    if (res.status !== 200) throw new Error(toast.error(res.message));
                    const { id: uId, userId, fullName: name, email, role, status, store } = res.data;
                    const oldList = { ...usrAdmins };
                    dispatch(setAdminList({ ...oldList, totalDocs: Number(oldList.totalDocs + 1), docs: [{ _id: uId, id: userId, name, store: store.name || 'Empty', role, email, status: status ? 'active' : 'deactive' }, ...oldList.docs] }))
                    toast.success('Add new user!');
                    navigate('/users');
                }).catch((e) => console.log(e)).finally(() => setOnLoad(false));
            } else {
                onUpdateUser({ ...data, store: store, image: image, id: id, status: activeStatus.value })
                    .then((res) => {
                        dispatch(setUpdateAdmin(res.data));
                        toast.success('Updated user!');
                        navigate('/users');
                    })
                    .catch(() => toast.error('Something went wrong!'))
                    .finally(() => setOnLoad(false));
            }
        } catch (error) {
            console.log(error);
            setOnLoad(false);
        }
    };
    // View Codes
    if (onLoad) return <SkillTon />
    return (
        <FormPage title={id === 'create' ? 'Create User' : 'Edit User'} onBack={() => navigate('/users')}>
            <FormCard onSubmit={handleSubmit(onSubmit)}>
                <Upload image={image} setImage={setImage} register={{ ...register('image', { onChange: (e) => CheckImgSize(e, setImage) }) }} />

                <FormGrid>
                    <Input label="Name" placeholder="Type name" rest={{ ...register('fullName'), required: true, autoComplete: 'off' }} />
                    <Input label="Email" placeholder="Type email" rest={{
                        ...register('email', {
                            pattern: {
                                value: RXEmail.emailValid,
                                message: 'Invalid email address',
                            },
                        }), required: true, autoComplete: 'off'
                    }} error={ErrCheck(errors, 'email')} />
                    <Input label="Password" type="password" placeholder={id === 'create' ? 'Type password' : 'Leave blank to keep current'} rest={{ ...register('password'), required: (id !== 'create') ? false : true, autoComplete: 'new-password' }} />
                    <Dropdown
                        defaultValue={activeStatus}
                        type='input'
                        data={statusList}
                        label='Status'
                        className='w-full'
                        onChange={(value) => setActiveStatus(value)} />
                    {user?.role === 'superadmin' ? (
                        <div className="sm:col-span-2">
                            <Dropdown defaultValue={store} type='input' other={true} data={stores} label='Organization Name' className='w-full' onChange={({ id }) => setStore(id)} onScroll={(e) => onScrollUsers(e)} />
                        </div>
                    ) : null}
                    <div className="sm:col-span-2"><Input label="Address" placeholder="Type address" rest={{ ...register('address'), autoComplete: 'off' }} /></div>
                </FormGrid>

                <FormActions>
                    <Button style='outline' className='!py-1.5 !px-4 !text-sm' onClick={() => navigate('/users')} type="button">Cancel</Button>
                    <Button style='secondary' type="submit" className='!py-1.5 !px-4 !text-sm'>{id === 'create' ? 'Create' : 'Update'}</Button>
                </FormActions>
            </FormCard>
        </FormPage>
    )
}
