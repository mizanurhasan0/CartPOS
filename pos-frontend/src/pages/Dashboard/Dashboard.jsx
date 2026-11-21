import React, { useEffect } from "react";
import DashboardSuper from "@/feature/Dashboard/components/DashboardSuper";
import DashboardAdmin from "@/feature/Dashboard/components/DashboardAdmin";
import { shallowEqual, useSelector } from "react-redux";
import { useNavigate } from "react-router";

export default function Dashboard() {
    const { user } = useSelector((state) => ({ user: state.authStore.user }), shallowEqual);
    const nevigate = useNavigate();

    useEffect(() => {
        if (user.role === 'user') return nevigate('/user-sales');

    }, [user]);

    if (user.role === 'superadmin') return <DashboardSuper />;
    else if (user.role === 'admin') return <DashboardAdmin />;
    else if (user.role === 'user') return;
    else if (user.role === undefined) return nevigate('/auth');
}
