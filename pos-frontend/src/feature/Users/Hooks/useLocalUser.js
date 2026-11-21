import useGlobal from "@/Hooks/useGlobal";
import { setAdminList } from "@/store/Reducer/userSlice";
import useFetch from "@/utils/hooks/useFetch";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function useLocalUser() {
  const dispatch = useDispatch();
  const { get, post, patch, deleteApi } = useFetch();
  const { setWaiting } = useGlobal();

  const onCreateUser = (data) => {
    try {
      const { image } = data;
      delete data.image;

      const fd = new FormData();
      const payload = {
        image: image,
        data: JSON.stringify(data),
      };
      Object.keys(payload).forEach((key) => fd.append(key, payload[key]));
      return new Promise((resolve, reject) => {
        post("/user/register", fd).then((res) => resolve(res)).catch((e) => reject(e));
      })

    } catch (error) {
      console.log(error);
    }
  }
  const onUpdateUser = (data) => {
    const fd = new FormData();
    const payload = {};
    if (typeof data.store !== 'string') data.store = data.store.id;
    if (data.image?.name) payload.image = data.image;
    delete data.image;
    if (!data.password) delete data.password;
    payload.data = JSON.stringify(data);
    Object.keys(payload).forEach((key) => fd.append(key, payload[key]));
    return new Promise((resolve, reject) => {
      patch(`/user/${data.id}`, fd).then((res) => resolve(res)).catch((e) => reject(e));
    })
  }

  const getUserById = (id) => {
    try {
      return new Promise((resolve, reject) => {
        get(`/user/${id}`).then((res) => resolve(res)).catch((c) => reject(c))
      });
    } catch (error) {
      console.log(error);
    }
  }
  const onDeleteAdmin = (id, setModal) => {
    setWaiting(true);
    deleteApi(`/user/${id}`).then(() => {
      toast.success('Deleted user!');
      setModal({ modal: false, id: null });
      dispatch((update, state) => {
        const oldAdLst = state().userStore.usrAdmins;
        const newList = oldAdLst.docs.filter((u) => u._id !== id);
        update(setAdminList({ ...oldAdLst, totalDocs: Number(oldAdLst.totalDocs - 1), docs: newList }));
      });
    }).catch(() => toast.error('Soemthing went wrong!'))
      .finally(() => setWaiting(false));
  }
  let time;
  const searchHandler = (e) => {
    clearTimeout(time);
    time = setTimeout(() => {
      setWaiting(true);
      const key = e.target.value;
      let url = key ? `/user?search=${key}` : '/user';
      get(url)
        .then(({ data, status }) => {
          if (status === 200) {
            const dt = data.docs.map((m) => ({ _id: m.id, id: m.userId, name: m.fullName, store: m?.store?.name || 'Empty', role: m.role, email: m.email, status: m.status ? 'active' : 'deactive', }));
            dispatch(setAdminList({ ...data, docs: dt }));
          }
        })
        .catch(error => toast.error(error.message))
        .finally(() => setWaiting(false));
    }, 1000);
  }

  return {
    onCreateUser,
    onUpdateUser,
    getUserById,
    onDeleteAdmin,
    searchHandler,
    // getOrgns,
    // filterFetch,
    // State
  }
}

