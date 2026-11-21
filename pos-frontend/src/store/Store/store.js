import { configureStore } from "@reduxjs/toolkit";
import categorySlice from "../Reducer/categorySlice";
import cartSlice from "../Reducer/cartSlice";
import productSlice from "../Reducer/productSlice";
import AuthSlice from "@/feature/Authentication/AuthSlice";
import storeSlice from "../Reducer/storeSlice";
import inventorySlice from "../Reducer/inventotySlice";
import userSlice from "../Reducer/userSlice";
import notificationSlice from "../Reducer/notificationSlice";
import accountsSlice from "../Reducer/AccountSlice";

export const store = configureStore({
    reducer: {
        categoryStore: categorySlice,
        cartStore: cartSlice,
        productStore: productSlice,
        authStore: AuthSlice,
        storeStore: storeSlice,
        userStore: userSlice,
        inventoryStore: inventorySlice,
        notificationStore: notificationSlice,
        accountsStore: accountsSlice,
    },
})