import React from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components';
import Input from '@/components/Shared/Inputs/Input';
import useFetch from '@/utils/hooks/useFetch';
import { setValue } from '@/store/Reducer/storeSlice';

const Tax = () => {
    const { patch, loading } = useFetch();
    const { user } = useSelector((state) => state.authStore);
    const dispatch = useDispatch();
    const { tax } = useSelector((state) => ({
        tax: state.storeStore.store.taxPercent,
    }));

    const handleUpdate = (value) => {
        patch(`/store/${user?.store?.id}`, { data: JSON.stringify({ taxPercent: value }) })
            .then((res) => {
                if (!res.data) return toast.error('Something Went Wrong');
                dispatch(setValue({ target: 'store', value: res.data }))
                toast.success('Tax updated successfully');
            })
            .catch((error) => toast.error(error?.message));
    };


    return (
        <form className="rounded-xl border border-border p-3" onSubmit={(e) => {
            e.preventDefault();
            handleUpdate(e.target.tax.value);
        }}>
            <h2 className="text-sm font-semibold text-primary2 mb-2">Tax (%)</h2>
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <Input className="w-full" type="number" name="tax" rest={{ defaultValue: tax }} placeholder="15%" />
                </div>
                <Button
                    rest={{ disabled: loading }}
                    style="secondary"
                    className="!py-1.5 !px-4 !text-sm"
                    type="submit"
                >
                    Update
                </Button>
            </div>
        </form>
    );
};

export default Tax;
