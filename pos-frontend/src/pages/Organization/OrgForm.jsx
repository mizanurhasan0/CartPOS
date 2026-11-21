import { Button, Dropdown, FormPage, FormCard, FormGrid, FormActions } from '@/components'
import Upload from '@/components/Forms/Upload';
import Input from '@/components/Shared/Inputs/Input';
import { addNewStore, updateDropStore } from '@/store/Reducer/userSlice';
import CheckImgSize from '@/utils/helpers/CheckImgSize';
import useFetch from '@/utils/hooks/useFetch';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

export default function OrgForm() {
    const dispatch = useDispatch();

    const { id } = useParams();
    const { register, handleSubmit, setValue } = useForm();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [status, setStatus] = useState(null);
    const { post, get, patch, loading } = useFetch();

    useEffect(() => {
        if (id !== 'create') {
            get(`/store/${id}`)
                .then((data) => {
                    setImage(data?.data?.image);
                    setValue('name', data?.data?.name);
                    setValue('address', data?.data?.address);
                    setValue('phone', data?.data?.phone);
                    setStatus({ id: data?.data?.id, name: data?.data?.status, value: data?.data?.status });
                    setValue('taxPercent', data?.data?.taxPercent);
                })
                .catch((e) => console.log(e))
        }
    }, [id])

    const onSubmit = (values) => {

        if (id === 'create') {
            try {
                const fd = new FormData();
                const payload = {
                    image: image,
                    data: JSON.stringify({
                        ...values,
                        status: status.value,
                        currency: { name: 'currency', symbol: '$' },
                    })
                };
                Object.keys(payload).forEach((key) => fd.append(key, payload[key]));

                post("/store", fd)
                    .then((res) => {
                        if (!res.data) return toast.error('Failed to Create');
                        toast.success('New Organization Created');
                        dispatch(addNewStore({ id: res.data.id, name: res.data.name, value: res.data.id }));
                        navigate('/organization');
                    })
                    .catch(() => {
                        console.log('Failed to Create');
                    });

            } catch (error) {
                toast.error('Failed to Create')
            }
        }
        else {
            try {
                const fd = new FormData();
                const payload = {
                    data: JSON.stringify({
                        ...values,
                        status: status.value
                    })
                };
                if (typeof (image) !== 'string') {
                    payload.image = image;
                }
                Object.keys(payload).forEach((key) => fd.append(key, payload[key]));
                return new Promise((resolve, reject) => {
                    patch(`/store/${id}`, fd).then((res) => {
                        if (res.status === 200) dispatch(updateDropStore({ id: res.data.id, name: res.data.name }));
                        resolve(res);
                        toast.success('Updated Organization');
                        navigate('/organization')
                    }).catch((e) => { reject(e); toast.error('Failed to update') });
                })
            } catch (error) {
                toast.error('Failed to Update')
            }
        }
    }

    return (
        <FormPage title={id === 'create' ? 'New Organization' : 'Edit Organization'} onBack={() => navigate('/organization')}>
            <FormCard onSubmit={handleSubmit(onSubmit)}>
                <Upload image={image} setImage={setImage} register={{ ...register('image', { onChange: (e) => CheckImgSize(e, setImage) }) }} />

                <FormGrid>
                    <Input label="Organization Name" placeholder="Type Organization name" rest={{ ...register('name'), required: true, autoComplete: 'off' }} />
                    <Input label="Phone Number" placeholder="Type phone number" rest={{ ...register('phone'), required: true, autoComplete: 'off' }} />
                    <div className="sm:col-span-2">
                        <Input label="Address" placeholder="Type address" rest={{ ...register('address'), required: true, autoComplete: 'off' }} />
                    </div>
                    <Input label="Tax (%)" placeholder="Tax for every item in %" rest={{ ...register('taxPercent', { maxLength: 3, valueAsNumber: true, validate: (value) => value > 0 }), required: true }} />
                    <Dropdown
                        defaultValue={status}
                        type='input'
                        data={[{ id: 1, name: 'Active', value: 'active' }, { id: 2, name: 'Deactive', value: 'deactive' }]}
                        label='Status'
                        className='w-full'
                        onChange={(value) => setStatus(value)} />
                </FormGrid>

                <FormActions>
                    <Button style='outline' className='!py-1.5 !px-4 !text-sm' onClick={() => navigate(-1)} type="button">Cancel</Button>
                    <Button rest={{ disabled: loading }} style='secondary' type="submit" className='!py-1.5 !px-4 !text-sm'>{id === 'create' ? 'Create' : 'Update'}</Button>
                </FormActions>
            </FormCard>
        </FormPage>
    )
}
