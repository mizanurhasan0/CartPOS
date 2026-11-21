import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   data: {},
   page:1,
   sort: false,
   status:'all',
   search:'',
   stats: {}

}

export const AccountSlice = createSlice({
  name: 'acounts',
  initialState,
  reducers: {
    setAccountsData: (state, {payload}) => {
      if(payload.target==='status' || payload.target==='search'){
        state.page=1;
      }
        state[payload.target]= payload.value;      
    },
    
  },
})

// Action creators are generated for each case reducer function
export const { setAccountsData } = AccountSlice.actions

export default AccountSlice.reducer;