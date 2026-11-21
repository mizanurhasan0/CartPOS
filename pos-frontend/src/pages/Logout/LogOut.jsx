import { useGlobalCtx } from '@/Context/GlobalProvider';
import { removeUser, setLoading } from '@/feature/Authentication/AuthSlice';
import useFetch from '@/utils/hooks/useFetch';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

const LogOut = () => {
    const { post } = useFetch();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { socket } = useGlobalCtx();

    useEffect(() => {
        dispatch(setLoading());
        post('/user/logout').then(res => {
            if (res.status === 200) {
                dispatch(removeUser());
                dispatch(setLoading());
                // toast.success(res?.data);
                socket.disconnect();
                navigate('/auth');
            }
            else toast?.error('Something wents wrong');

        }).catch(error => console.log(error));


    }, [])
    return (
        <div className="flex min-h-screen items-center justify-center text-sm text-primary1">
            Signing out...
        </div>
    );
};

export default LogOut;