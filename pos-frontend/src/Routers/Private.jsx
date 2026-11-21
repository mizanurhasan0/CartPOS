import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';

const roles = {
    'superadmin': ['DashboardLayout', 'Dashboard', 'Organization', 'OrgForm', 'Users', 'UsrAction', 'Settings', 'HelpCenter', 'LogOut', 'DashboardAdmin'],
    'admin': ['DashboardLayout', 'Dashboard', 'UserSales', 'Users', 'UsrAction', 'Inventory', 'InvAction', 'History', 'Bills', 'BillPrint', 'Accounts', 'Settings', 'HelpCenter', 'LogOut', 'DashboardSalesTable', 'AddNewCost', 'Refund'],
    // cashier: sell, look up bills and stock (read-only), manage own profile. No finance, users, refunds or stock edits.
    'user': ['DashboardLayout', 'UserSales', 'Inventory', 'Bills', 'BillPrint', 'Settings', 'HelpCenter', 'LogOut'],
}
export default function Private({ children, name }) {
    const { user } = useSelector((state) => state.authStore);
    // console.log(user);
    if (Object.keys(user).length === 0) return <Navigate to='/auth' />
    // the cashier's home is the sales screen, not a dashboard
    if (name === 'Dashboard' && user.role === 'user') return <Navigate to='/user-sales' replace={true} />
    return (
        <>
            {roles[user.role]?.includes(name) ? children : <Navigate to="/not-found" replace={true} />}
        </>
    )
}
