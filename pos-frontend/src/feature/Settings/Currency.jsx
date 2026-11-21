import { Button } from "@/components";
import Input from "@/components/Shared/Inputs/Input";
import { setValue } from "@/store/Reducer/storeSlice";
// import { setValue } from "@/store/Reducer/storeSlice";
import useFetch from "@/utils/hooks/useFetch";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../Authentication/AuthSlice";
import Loading from "@/pages/Loading/Landing";

const Currency = ({ store }) => {

  const { patch } = useFetch();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue: setVal,
    setError,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {
    try {
      setLoading(true);
      if (data.currency === store.currency.symbol) {
        setError('currency');
        throw new Error(toast.error('No Changes has been made !'));
      }
      const fd = new FormData();
      const payload = {
        data: JSON.stringify({
          currency: { name: 'currency', symbol: data.currency }
        })
      };
      Object.keys(payload).forEach((key) => fd.append(key, payload[key]));

      patch(`/store/${store.id}`, fd).then((res) => {
        if (res.status === 200) {
          dispatch((update, state) => {
            const oldUser = state().authStore.user;
            const oldStock = state().storeStore.store;
            update(setValue({ target: 'store', value: { ...oldStock, currency: res.data.currency } || {} }));
            update(setUser({ ...oldUser, store: res.data || {} }));
            toast.success('Currency Updated.')
          })
        } else toast.error('something went wrong');

      }).catch((e) => { console.log(e) }).finally(() => setLoading(false));

    } catch (error) {
      console.log('Failed to Update')
      setLoading(false);
    }
  }
  useEffect(() => {
    setVal('currency', store?.currency?.symbol || '$');
  }, []);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border p-3 relative">
      <h2 className="text-sm font-semibold text-primary2 mb-2">Currency</h2>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label=""
            type='text' rest={{
              ...register('currency', {
                required: true,
              })
            }}
            className="w-full"
            error={errors['currency']}
            placeholder="Currency Symbol" />
        </div>
        <Button style='secondary' type="submit" className='!py-1.5 !px-4 !text-sm'>Update</Button>
      </div>
      {loading ? <div className="absolute inset-0 overflow-hidden rounded-xl"><Loading /></div> : ''}
    </form>
  );
};

export default Currency;
