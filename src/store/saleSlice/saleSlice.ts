import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type SalePaymentMethod = 'cash' | 'credit' | 'cheque';
export type SaleStatus = 'paid' | 'not_paid';

export type SaleLineItem = {
  product: string;
  productName: string;
  productSku: string;
  size: string;
  productPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  lineTotal: number;
};

export type Sale = {
  _id: string;
  salesId: string;
  salesDate: string;
  customer: string;
  lineItems: SaleLineItem[];
  discount: number;
  tax: number;
  shipping: number;
  otherExpenses: number;
  netTotal: number;
  status: SaleStatus;
  paymentMethod: SalePaymentMethod;
  createdAt: string;
  updatedAt: string;
};

export type PagedSalesParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  customer?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedSalesResponse = {
  data: Sale[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SaleState = { items: Sale[]; page: number; limit: number; total: number; totalPages: number };

const initialState: SaleState = { items: [], page: 1, limit: 10, total: 0, totalPages: 0 };

export const fetchSales = createAsyncThunk(
  'sale/fetchAll',
  async (params: PagedSalesParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedSalesResponse>('/sales/paged', { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteSale = createAsyncThunk(
  'sale/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/sales/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const saleSlice = createSlice({
  name: 'sale',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSales.fulfilled, (state, { payload }) => {
      state.items = payload.data;
      state.page = payload.page;
      state.limit = payload.limit;
      state.total = payload.total;
      state.totalPages = payload.totalPages;
    });
    builder.addCase(deleteSale.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((i) => i._id !== payload);
    });
  },
});

export default saleSlice.reducer;
