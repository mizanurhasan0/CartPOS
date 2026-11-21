import { Button } from "@/components";
import Input from "@/components/Shared/Inputs/Input";
import { setValue } from "@/store/Reducer/storeSlice";
import useFetch from "@/utils/hooks/useFetch";
import React from "react";
import { useForm } from "react-hook-form"
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const ChangePassword = () => {
  const passRegx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/
  const { patch, loading } = useFetch();
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {

    if (data?.newPassword !== data?.confirmPassword) {
      setError('confirmPassword');
      toast.error('Confirm password does not matched');
      return;
    }
    else if (data?.newPassword === data?.password) {
      setError('newPassword');
      toast.error('You can not use current password')
    }
    else {
      const passwordChange = {
        oldPass: data?.password,
        newPass: data?.newPassword
      }
      patch(`/user/me`, { passwordChange }).then(res => {
        if (res?.status === 200) {
          toast.success('Password Changed Successfully');
          dispatch(setValue({ target: 'store', value: res.data.store }));
        }
        else {
          toast.error(res?.message)
        }


      }).catch(error => console.log(error));



    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border p-4 lg:col-span-2">
      <h2 className="text-sm font-semibold text-primary2 mb-3">Password</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Current" id="current-password" type='password' className="w-full" rest={{
          ...register('password', {
            required: true,
          }),
          autoComplete: 'current-password',
        }} error={errors['password']} placeholder="Current password" />
        <Input label="New" id="new-password" type='password' className="w-full" rest={{
          ...register('newPassword', {
            required: true, pattern: {
              value: passRegx,
              message: ""
            }
          }),
          autoComplete: 'new-password',
        }} error={errors['newPassword']} placeholder="New password" />
        <Input label="Confirm" id="confirm-password" type='password' className="w-full" rest={{
          ...register('confirmPassword', {
            required: true, pattern: {
              value: passRegx,
              message: ""
            }
          }),
          autoComplete: 'new-password',
        }} error={errors['confirmPassword']} placeholder="Confirm password" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <p className="text-xs text-label">Min 8 chars with upper and lower case, a number and a symbol.</p>
        <Button rest={{ disabled: loading }} type="submit" className="!py-1.5 !px-4 !text-sm w-full sm:w-auto" onClick={() => clearErrors()}>Update</Button>
      </div>
    </form>
  );
};

export default ChangePassword;
