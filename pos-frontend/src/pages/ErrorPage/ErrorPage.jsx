import React from 'react';
import {  useNavigate } from 'react-router-dom';
import ErrorIcon from '../../assets/Icons/404.svg?react';
const ErrorPage = () => {
    const navigate = useNavigate();
    return (
        <section className="min-h-screen px-4 flex items-center justify-center">
            <div className="text-center flex flex-col gap-3 items-center">
                <ErrorIcon className="max-w-[12rem] h-auto" />
                <h2 className="text-primary3 text-2xl font-semibold">Error 404</h2>
                <p className="text-primary text-sm">Page not found.</p>
                <button onClick={()=> navigate('/')} className="mt-1 px-6 py-1.5 text-sm text-white bg-primary2 hover:bg-primary3 focus-visible:ring-2 focus-visible:ring-primary3/50 outline-none rounded-full font-semibold active:scale-95 transition">Go Back</button>
            </div>
        </section>
    );
};

export default ErrorPage;
