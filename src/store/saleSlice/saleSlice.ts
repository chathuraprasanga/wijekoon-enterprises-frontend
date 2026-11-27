import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type SalePartMethod = 'cash' | 'credit' | 'cheque';
// 'split' = paid several ways (see Sale.payments)
export type SalePaymentMethod = SalePartMethod | 'split';
export type SaleStatus = 'paid' | 'partially_paid' | 'not_paid';

export type SalePayment = { method: SalePartMethod; amount: number };

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
  customerRef?: string;
  notes?: string;
  dueDate?: string;
  createdByName?: string;
  paymentHistory?: {
    method: string;
    amount: number;
    at: string;
    reference?: string;
    byName?: string;
  }[];
  /** Empty/missing on sales saved before split payments existed. */
  payments?: SalePayment[];
  createdAt: string;
  updatedAt: string;
};

/** What the server accepts; it recomputes line totals, the net total, payment method and status. */
export type SaleInput = {
  customer: string;
  salesDate: string;
  lineItems: Omit<SaleLineItem, 'lineTotal'>[];
  discount: number;
  tax: number;
  shipping: number;
  otherExpenses: number;
  payments: SalePayment[];
  customerRef?: string;
  notes?: string;
  dueDate?: string;
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

export const fetchSaleById = createAsyncThunk(
  'sale/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<Sale>(`/sales/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createSale = createAsyncThunk(
  'sale/create',
  async (payload: SaleInput, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<Sale>('/sales', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateSale = createAsyncThunk(
  'sale/update',
  async (payload: SaleInput & { _id: string }, { rejectWithValue }) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<Sale>(`/sales/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export type SalePaymentInput = {
  method: 'cash' | 'cheque';
  amount: number;
  cheque?: { depositDate: string; bankCode: string; branchCode: string; chequeNumber: string };
};

export const recordSalePayment = createAsyncThunk(
  'sale/recordPayment',
  async (p: SalePaymentInput & { id: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = p;
      const { data } = await axiosInstance.post<Sale>(`/sales/${id}/payments`, body);
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
