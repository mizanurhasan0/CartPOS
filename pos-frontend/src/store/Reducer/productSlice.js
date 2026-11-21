import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    page: 1,
    toalPage: 0,
    totalDocs: 0,
    prevPage: null,
    nextPage: null,
  },
  reducers: {
    setValue: (state, action) => {
      state[action.payload.target] = action.payload.value;
    },
    updateProduct: (state, action) => {
      state[action.payload.target] = [...state.products, ...action.payload.value]
    }
  }
});

export const { setValue, updateProduct } = productSlice.actions;

export default productSlice.reducer;