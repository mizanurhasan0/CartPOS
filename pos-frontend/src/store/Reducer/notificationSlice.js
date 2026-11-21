import { createSlice } from "@reduxjs/toolkit";

export const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notStocks: [],
        seen: false,
    },
    reducers: {
        addStock: (state, action) => {
            const oldStock = [...state.notStocks];
            state.notStocks = [action.payload, ...oldStock];
        },
        setSeen: (state, action) => {
            state.seen = action.payload;
        },

    }
});
export const { addStock, setSeen } = notificationSlice.actions;
export default notificationSlice.reducer;

