import { ImgUpload } from '@/assets/SvgComponents';
import { setValue } from '@/store/Reducer/storeSlice';
import useFetch from '@/utils/hooks/useFetch';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const OwnerInfo = ({ user = null }) => {
  const { data } = useSelector((state) => ({
    data: state.storeStore.StoreUsers,
  }));
  const { get } = useFetch();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      get(`/setting/logged-users/${user?.store?.id}`).then(res => {
        console.log(res);
        dispatch(setValue({ target: 'StoreUsers', value: res?.data }));
      }).catch(error => console.log(error));
    }
  }, [user]);

  const roleName = (r) => (r === 'superadmin' ? 'Super Admin' : r === 'admin' ? 'Admin' : 'User');
  const Person = ({ p }) => (
    <div className="flex items-center gap-3">
      {p?.image ? (
        <img
          className="w-9 h-9 rounded-full border border-primary object-cover shrink-0"
          src={import.meta.env.VITE_SERVER_URL + "/file/" + p?.image}
          onError={(e) => { e.target.src = ImgUpload }}
        />
      ) : (
        <div className="bg-yellow w-9 h-9 rounded-full flex justify-center items-center text-base shrink-0">
          {p?.fullName ? p?.fullName[0] : "X"}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{p?.fullName || "No Name"}</p>
        <p className="text-xs text-black2">{roleName(p?.role)}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="rounded-xl border border-border p-4 lg:col-span-2">
        <h2 className="text-sm font-semibold text-primary2 mb-3">Account Owner</h2>
        <Person p={user} />
      </div>

      {user?.role === "admin" ? (
        <div className="rounded-xl border border-border p-3">
          <h2 className="text-sm font-semibold text-primary2 mb-2">Logged In ({data?.length || 0})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {data?.map((d, index) => <Person key={index} p={d} />)}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default OwnerInfo;
