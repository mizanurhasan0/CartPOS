import { createSlice } from "@reduxjs/toolkit";

const storeSlice = createSlice({
  name: 'store',
  initialState: {
    stores: [],
    pagination: {
      page: 1,
      totalDocs: 0,
      totalPage: 0,
      next: null,
      prev: null,
    },
    store: null,
    storeDetails: {
      data: [],
      type: 'items',
      page: 1,
      next: null,
      prev: null,
      totalDocs: 0,
    },
    history: {
      data: [],
      type: 'today',
      page: 1,
      next: null,
      prev: null,
      totalDocs: 0,
    },
    bills: {
      data: [],
      type: 'today',
      page: 1,
      next: null,
      prev: null,
      totalDocs: 0,
    },
    statistics: {
      totalStore: 0,
      activeStore: 0,
      totalUser: 0,
      totalRevenue: 0,
      topSellingStore: [],
    },
    adminStatistics: {
      stockOutProducts: 0,
      restockProducts: 0,
      totalItems: 0,
      dailySales: 0,
      dailyProfit: 0,
      yearlySales: 0,
      yearlyProfit: 0,
      topSellingProducts: [],
    },
    StoreUsers: [],
  },
  reducers: {
    setValue: (state, action) => {
      state[action.payload.target] = action.payload.value;
    },
    updateStore: (state, action) => {
      state.stores = state.stores.map((ech) => {
        if (ech.id === action.payload.id) {
          return action.payload;
        }
        return ech;
      })
    },
    setStoreDetails: (state, action) => {
      state.storeDetails[action.payload.target] = action.payload.value;
    },
    setStoreHistory: (state, action) => {
      state.history[action.payload.target] = action.payload.value;
    },
    setBills: (state, action) => {
      state.bills[action.payload.target] = action.payload.value;
    },
  },
});

export const { setValue, setStoreDetails, updateStore, setStoreHistory, setBills } = storeSlice.actions;
export default storeSlice.reducer;