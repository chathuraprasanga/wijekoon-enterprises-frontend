import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice/authSlice';
import customerReducer from '@/store/customerSlice/customerSlice';
import roleReducer from '@/store/roleSlice/roleSlice';
import permissionReducer from '@/store/permissionSlice/permissionSlice';
import userReducer from '@/store/userSlice/userSlice';
import supplierReducer from '@/store/supplierSlice/supplierSlice';
import productReducer from '@/store/productSlice/productSlice';
import saleReducer from '@/store/saleSlice/saleSlice';
import chequeReducer from '@/store/chequeSlice/chequeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    role: roleReducer,
    permission: permissionReducer,
    user: userReducer,
    supplier: supplierReducer,
    product: productReducer,
    sale: saleReducer,
    cheque: chequeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
