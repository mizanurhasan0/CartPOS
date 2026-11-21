import { createSlice } from "@reduxjs/toolkit";

export const AuthSlice = createSlice({
    name: "auth",
    initialState: {
        user: {},
        forget: { email: '', token: '' },
        loading: false,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setForget: (state, action) => {
            state.forget = action.payload;
        },
        setLoading: (state) => {
            state.loading = !state.loading;
        },
        removeUser: (state) => {
            state.user = {};
        },
    }
});
export const { setUser, setForget, setLoading, removeUser } = AuthSlice.actions;
export default AuthSlice.reducer;

