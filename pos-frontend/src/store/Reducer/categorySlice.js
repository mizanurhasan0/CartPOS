import { createSlice } from '@reduxjs/toolkit';


const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    page: 1,
    totalPage: 0,
    totalDocs: 0,
    prevPage: null,
    nextPage: null
  },
  reducers: {
    setValue: (state, action) => {
      state[action.payload.target] = action.payload.value;
    }
  }
});

export const { setValue } = categorySlice.actions;
export default categorySlice.reducer; 