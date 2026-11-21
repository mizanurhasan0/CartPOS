import ChangePassword from '@/feature/Settings/ChangePassword';
import Currency from '@/feature/Settings/Currency';
import Notification from '@/feature/Settings/Notification';
import OwnerInfo from '@/feature/Settings/OwnerInfo';
import Tax from '@/feature/Settings/Tax';
import React from 'react';
import { useSelector } from 'react-redux';

const Settings = () => {
  const { user } = useSelector((state) => state.authStore);
  const role = user?.role;
  return (
    <div className='mx-auto w-full max-w-4xl'>
      <h1 className='text-lg font-semibold text-primary mb-3'>Settings</h1>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        <OwnerInfo user={user} />
        {role !== 'superadmin' && <Notification user={user} />}
        {role === 'admin' && <Currency store={user?.store || {}} />}
        {role === 'admin' && <Tax />}
        <ChangePassword user={user} />
      </div>
    </div>
  );
};

export default Settings;
