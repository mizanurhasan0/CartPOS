import { useDispatch } from 'react-redux';
import { Components } from '@/pages';
import Private from './Private';
import React, { Suspense, lazy, useLayoutEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import useFetch from '@/utils/hooks/useFetch';
import Loading from '@/pages/Loading/Landing';
import { ErrorPage } from '@/pages';
import { setUser } from '@/feature/Authentication/AuthSlice';
// import InvAction from '@/pages/Inventory/InvAction';
import { useGlobalCtx } from '@/Context/GlobalProvider';
import { setValue } from '@/store/Reducer/storeSlice';
import PrintPage from '@/pages/PrintPage/PrintPage';
// import Refund from '@/pages/Refund/Refund';

const DashboardLayout = lazy(() => import('../layout/DashboardLayout'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Inventory = lazy(() => import('../pages/Inventory/Inventory'));
const DashboardSalesTable = lazy(() => import('../pages/Dashboard/DashboardSalesTable'));
const InvAction = lazy(() => import('../pages/Inventory/InvAction'));
const Organization = lazy(() => import('../pages/Organization/Organization'));
const HelpCenter = lazy(() => import('../pages/HelpCenter/HelpCenter'));
const OrgForm = lazy(() => import('../pages/Organization/OrgForm'));
const Users = lazy(() => import('../pages/Users/Users'));
const UsrAction = lazy(() => import('../pages/Users/UsrAction'));
const Login = lazy(() => import('../pages/Login/Login'));
const AuthWrapper = lazy(() => import('../feature/Authentication/AuthWrapper'));
const Forget = lazy(() => import('../pages/Forget/Forget'));
// const SignUp = lazy(() => import('../pages/SignUp/SignUp'));
// const Layout = lazy(() => import('../layout/Layout'));
const Bills = lazy(() => import('@/pages/Bills/Bills'));
const BillPrint = lazy(() => import('@/pages/Bills/BillPrint'));
const History = lazy(() => import('@/pages/History/History'));
const UserSales = lazy(() => import('@/pages/UserSales/UserSales'));
const Settings = lazy(() => import('@/pages/Settings/Settings'));
const LogOut = lazy(() => import('@/pages/Logout/LogOut'));
const DashboardAdmin = lazy(() => import('@/feature/Dashboard/components/DashboardAdmin'));
const Accounts = lazy(() => import('@/pages/Accounts/Accounts'));
const AddNewCost = lazy(() => import('@/pages/Accounts/AddNewCost'));
const Refund = lazy(() => import('@/pages/Refund/Refund'));



function Routers() {
  const { get } = useFetch();
  const dispatch = useDispatch();
  const { socket, getStores, getProductCategory } = useGlobalCtx();
  const [userLoad, setUserLoad] = useState(true);
  useLayoutEffect(() => {
    get('/user/me').then((res) => {
      if (res.status === 200) {
        if (res.data.role === 'superadmin') getStores({ page: 1 });
        else getProductCategory();
        dispatch(setUser(JSON.parse(JSON.stringify(res.data))));
        dispatch(setValue({ target: 'store', value: res.data.store }));
        socket.connect();
      }
    }).catch((e) => console.log(e)).finally(() => setUserLoad(false));
  }, []);
  if (userLoad) return <Loading />;
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Suspense fallback={<Loading />}><Private name="Dashboard"><Dashboard /></Private></Suspense>} />
        <Route path='organization' element={<Suspense fallback={<Loading />} ><Private name="Organization"><Organization /></Private></Suspense>} />
        <Route path='organization/:id' element={<Suspense fallback={<Loading />} ><Private name="OrgForm"><OrgForm /></Private></Suspense>} />
        <Route path="users" element={<Suspense fallback={<Loading />} ><Private name="Users"><Users /></Private></Suspense>} />
        <Route path="users/:id" element={<Suspense fallback={<Loading />} ><Private name="UsrAction"><UsrAction /></Private></Suspense>} />
        <Route path='store/:id' element={<Suspense fallback={<Loading />} ><Private name="DashboardAdmin"><DashboardAdmin /></Private></Suspense>} />
        <Route path='store-details/:id' element={<Suspense fallback={<Loading />} ><Private name="DashboardSalesTable"><DashboardSalesTable /></Private></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={<Loading />} ><Private name="Inventory"><Inventory /></Private></Suspense>} />
        <Route path="inventory/:id" element={<Suspense fallback={<Loading />} ><Private name="InvAction"><InvAction /></Private></Suspense>} />
        <Route path="/user-sales" element={<Suspense fallback={<Loading />} ><Private name="UserSales"><UserSales /></Private></Suspense>} />
        <Route path='/bill' element={<Suspense fallback={<Loading />} ><Private name="Bills"><Bills /></Private></Suspense>} />
        <Route path='/bill-print' element={<Suspense fallback={<Loading />} ><Private name="BillPrint"><BillPrint /></Private></Suspense>} />
        <Route path='/history' element={<Suspense fallback={<Loading />} ><Private name="History"><History /></Private></Suspense>} />
        <Route path='/helpCenter' element={<Suspense fallback={<Loading />} ><Private name="HelpCenter"><HelpCenter /></Private></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<Loading />} ><Private name="Settings"><Settings /> </Private> </Suspense>} />
        <Route path="/logout" element={<Suspense fallback={<Loading />} ><Private name="LogOut"><LogOut /> </Private> </Suspense>} />
        <Route path="/accounts" element={<Suspense fallback={<Loading />} ><Private name="Accounts"><Accounts /> </Private> </Suspense>} />
        <Route path="/accounts/add-new-cost" element={<Suspense fallback={<Loading />} ><Private name="AddNewCost"><AddNewCost /> </Private> </Suspense>} />
        <Route path="/refund" element={<Suspense fallback={<Loading />} ><Private name="Refund"><Refund /> </Private> </Suspense>} />
        <Route path="/components" element={<Components />} />
        <Route path="/:size/:id" element={<PrintPage />} />
      </Route>
      <Route path="/auth" element={<Suspense fallback={<Loading />}><AuthWrapper /></Suspense>}>
        <Route index element={<Login />} />
        {/* <Route path="sign-up" element={<SignUp />} /> */}
        <Route path="forget" element={<Forget />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default Routers;