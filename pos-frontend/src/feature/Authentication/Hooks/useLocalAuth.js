import useFetch from "@/utils/hooks/useFetch";
import { toast } from "react-hot-toast";
import { setForget, setUser } from "../AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useGlobalCtx } from "@/Context/GlobalProvider";
import { setValue } from "@/store/Reducer/storeSlice";

export default function useLocalAuth() {
  const { getAllUsers, getStores, socket, getProductCategory } = useGlobalCtx();
  const { post, loading } = useFetch();
  const dispatch = useDispatch();
  const { forget } = useSelector((state) => state.authStore);
  const navigate = useNavigate();

  /**
   * 
   * @param {data} param0 contains email and password 
   */
  const onUserLogin = (data) => {
    try {
      post("/user/login", data).then((res) => {
        if (res?.status !== 200) throw new Error(toast.error(res?.message, { className: 'text-center' }));
        navigate("/");
        socket.connect();
        // toast.success('Login success!');

        dispatch(setUser(res.data));
        dispatch(setValue({ target: 'store', value: res.data.store }));
        if (res.data.role !== 'user') getAllUsers({ page: 1 });
        if (res.data.role === 'superadmin') getStores({ page: 1 });
        else getProductCategory();
      }).catch((c) => console.log(c));
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * 
   * @param {data} param0  contains forget email
   * @param {setOption} param1 is a next component renders
   */
  const onSetOTP = ({ data, setOption }) => {
    try {
      post("/user/forgot/password", data).then((res) => {
        if (res.status !== 200) throw new Error(toast.error('Invalid email!'));
        dispatch(setForget({ email: data.email, token: res.data }))
        toast.success('OTP sent!');
        setOption('OTPComp');
      }).catch((c) => console.log(c));
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * 
   * @param {data} param0 contains OTP code
   * @param {setOption} param1 is state which handle next components
   */
  const onVerifyOTP = ({ data, setOption }) => {
    try {
      post("/user/otp/verify", { otp: data.otp, token: forget.token }).then((res) => {
        if (res?.status !== 200) throw new Error(toast.error('Invalid OTP!'));
        toast.success('Success!');
        setOption('NewPassComp');
      }).catch((c) => console.log(c));
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * 
   * @param {data} param0 contains new password and re-password
   */
  const onNewPass = ({ data }) => {
    try {
      post("/user/change/password", { ...data, email: forget.email, token: forget.token }).then((res) => {
        if (res?.status !== 200) throw new Error(toast.error('Invalid OTP!'));
        toast.success('Reset your password!');
        navigate('/auth');
        dispatch(setForget({ email: '', token: '' }))
      }).catch((c) => console.log(c));
    } catch (error) {
      console.log(error);
    }
  };
  return {
    // State
    loading,
    // Methods
    onUserLogin,
    onSetOTP,
    onVerifyOTP,
    onNewPass
  };
}
