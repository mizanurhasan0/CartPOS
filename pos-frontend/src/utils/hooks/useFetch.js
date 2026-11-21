import axios from 'axios';
import { useState } from 'react';

const useFetch = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const get = async (endpoint) => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}${endpoint}`, { withCredentials: true })
                .then(res => { setData(res.data); return { data: res.data, status: res.status } })
                .catch(({ response }) => ({ status: response.status, message: response.statusText }))
                .finally(() => setLoading(false));
            return response;
        } catch (error) {
            setError(error);
            throw new Error(error);
        }
    }
    const post = async (endpoint, payload) => {
        const options = { withCredentials: true };
        try {
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}${endpoint}`, payload, options)
                .then(res => { setData(res.data); return { data: res.data, status: res.status } })
                .catch((e) => ({ message: e.response.data, status: e.response.status }))
                .finally(() => setLoading(false));
            return response;
        } catch (error) {
            setError(error);
        }
    }

    const patch = async (endpoint, payload) => {
        const options = { withCredentials: true };
        try {
            setLoading(true);
            const response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}${endpoint}`, payload, options)
                .then(res => { setData(res.data); return { data: res.data, status: res.status } })
                .catch((e) => ({ message: e.response.data, status: e.response.status }))
                .finally(() => setLoading(false));
            return response;
        } catch (error) {
            setError(error);
        }
    }

    const deleteApi = async (endpoint) => {
        const options = { withCredentials: true };
        try {
            setLoading(true);
            const response = await axios.delete(`${import.meta.env.VITE_SERVER_URL}${endpoint}`,options)
                .then(res => { setData(res.data); return { data: res.data, status: res.status } })
                .catch((e) => ({ message: e.response.data, status: e.response.status }))
                .finally(() => setLoading(false));
            return response;
        } catch (error) {
            setError(error);
            throw new Error(error);
        }
    }

    return { data, loading, error, post, get, patch, deleteApi };
};

export default useFetch;