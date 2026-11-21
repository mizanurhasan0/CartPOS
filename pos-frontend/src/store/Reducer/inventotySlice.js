import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: {},
  productCategory: [],
  page: 1,
  sort: false,

}

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryData: (state, { payload }) => {
      state[payload.target] = payload.value;
    },
    setProductCategory: (state, { payload }) => {
      state.productCategory = payload;
    },
    addProductCategory: (state, { payload }) => {
      state.productCategory = [...state.productCategory, payload];
    },
  },
})

// Action creators are generated for each case reducer function
export const { setInventoryData, setProductCategory, addProductCategory } = inventorySlice.actions

export default inventorySlice.reducer;