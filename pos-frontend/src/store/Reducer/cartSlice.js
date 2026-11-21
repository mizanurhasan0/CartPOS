import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: [],
  },
  reducers: {
    addToCart: (state, action) => {
      let newAdd = true;
      state.cart = state.cart.map((ech) => {
        if (ech.item.id === action.payload.item.id) {
          newAdd = false;
          return action.payload;
        }
        return ech;
      });
      if (newAdd) state.cart = [action.payload, ...state.cart];
    },

    updateQty: (state, action) => {
      state.cart = state.cart.map((ech) => {
        if (ech.item.id === action.payload.id) {
          ech.quantity = action.payload.quantity;
          return ech;
        }
        return ech;
      })
    },

    changeDiscountType: (state, action) => {
      state.cart = state.cart.map((ech) => {
        if (ech.item.id === action.payload.id) {
          ech.percentageDiscount = action.payload.value;
          return ech;
        }
        return ech;
      })
    },

    updateDiscount: (state, action) => {
      state.cart = state.cart.map((ech) => {
        if (ech.item.id === action.payload.id) {
          ech.discount = action.payload.discount;
          return ech;
        }
        return ech;
      })
    },

    removeItem: (state, action) => {
      state.cart = state.cart.filter((ech) => ech.item.id !== action.payload.id);
    },

    clearCart: (state) => {
      state.cart = [];
    }
  },
});

export const { addToCart, updateQty, removeItem, clearCart, updateDiscount, changeDiscountType } = cartSlice.actions;
export default cartSlice.reducer;