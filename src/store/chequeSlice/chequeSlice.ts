import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type Cheque = {
  _id: string;
  customer: string;
  sale: string;
  depositDate: string;
  bankCode: string;
  branchCode: string;
  chequeNumber: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type ChequeInput = Pick<
  Cheque,
  'customer' | 'sale' | 'depositDate' | 'bankCode' | 'branchCode' | 'chequeNumber' | 'amount'
>;

export type PagedChequesParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  customer?: string;
  sale?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedChequesResponse = {
  data: Cheque[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ChequeState = {
  items: Cheque[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const initialState: ChequeState = { items: [], page: 1, limit: 10, total: 0, totalPages: 0 };

export const fetchCheques = createAsyncThunk(
  'cheque/fetchAll',
  async (params: PagedChequesParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedChequesResponse>('/cheques/paged', { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createCheque = createAsyncThunk(
  'cheque/create',
  async (payload: ChequeInput, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<Cheque>('/cheques', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateCheque = createAsyncThunk(
  'cheque/update',
  async (payload: ChequeInput & { _id: string }, { rejectWithValue }) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<Cheque>(`/cheques/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteCheque = createAsyncThunk(
  'cheque/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/cheques/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const chequeSlice = createSlice({
  name: 'cheque',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCheques.fulfilled, (state, { payload }) => {
      state.items = payload.data;
      state.page = payload.page;
      state.limit = payload.limit;
      state.total = payload.total;
      state.totalPages = payload.totalPages;
    });
    builder.addCase(updateCheque.fulfilled, (state, { payload }) => {
      state.items = state.items.map((i) => (i._id === payload._id ? payload : i));
    });
    builder.addCase(deleteCheque.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((i) => i._id !== payload);
    });
  },
});

export default chequeSlice.reducer;
