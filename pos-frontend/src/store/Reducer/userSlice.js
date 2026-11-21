import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "users",
    initialState: {
        stores: [{ id: 1, name: 'Select', value: null }],
        usrAdmins: {},
        uPaginate: { store: {}, admins: {} },
        loading: false,
        filter: { status: undefined, sort: false },
        totalUsers: 0,
    },
    reducers: {
        setStore: (state, action) => {
            const cobStores = [...state.stores, ...action.payload];
            const oldStoreStr = cobStores.map(JSON.stringify);
            const oldStoreSt = new Set(oldStoreStr);
            const newJsonArr = Array.from(oldStoreSt).map(JSON.parse);
            state.stores = newJsonArr;
        },
        addNewStore: (state, action) => {
            const oldStore = [...state.stores];
            const deleteFilter = oldStore.filter((s) => s.id !== 1);
            state.stores = [{ id: 1, name: 'Select', value: null }, action.payload, ...deleteFilter];
        },
        updateDropStore: (state, action) => {
            const idx = state.stores.findIndex((s) => s.id === action.payload.id);
            const { id, name } = action.payload;
            state.stores[idx] = { id: id, name: name, value: id };
        },
        setuPaginate: (state, action) => {
            const { name, totalPages, totalDocs, current, nextPage, prevPage } = action.payload;
            state.uPaginate[name] = { totalPage: totalPages, current: current, nextPage: nextPage, prevPage: prevPage, totalDocs: totalDocs }
        },
        setAdminList: (state, action) => {
            state.usrAdmins = action.payload;
        },
        setUpdateAdmin: (state, action) => {
            const m = action.payload;
            const idx = state.usrAdmins.docs.findIndex((u) => u._id === action.payload.id);
            state.usrAdmins.docs[idx] = { _id: m.id, id: m.userId, name: m.fullName, store: m?.store?.name || 'Empty', role: m.role, email: m.email,  status: m.status ? 'active' : 'deactive', };
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        setUsersLength: (state, action) => {
            state.totalUsers = action.payload;
        }

    }
});
export const { setStore, setuPaginate, setAdminList, setUpdateAdmin, setFilter, setUsersLength, addNewStore, updateDropStore } = userSlice.actions;
export default userSlice.reducer;

