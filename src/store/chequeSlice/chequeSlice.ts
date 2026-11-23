import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type Cheque = {
  _id: string;
  /** Only on the combined list: a cheque we received, or one we issued to a supplier. */
  kind?: 'received' | 'issued';
  /** 'other' = a party that isn't a customer (no customer / sale). */
  partyType?: 'customer' | 'supplier' | 'other';
  partyName?: string;
  customer?: string;
  sale?: string;
  depositDate: string;
  bankCode: string;
  branchCode: string;
  chequeNumber: string;
  amount: number;
  /** Lifecycle; rows from before it existed read as RECEIVED. */
  status?: 'RECEIVED' | 'DEPOSITED' | 'TRANSFERRED' | 'CLEARED' | 'RETURNED' | 'ISSUED';
  transferable?: boolean;
  expectedClearingDate?: string;
  depositLimitOverridden?: boolean;
  statusHistory?: { status: string; at: string; byName?: string; note?: string }[];
  /** Issued cheques only. */
  supplier?: string;
  supplierName?: string;
  payee?: string;
  order?: string;
  orderNo?: string;
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  issuedDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChequeInput = Pick<
  Cheque,
  'depositDate' | 'bankCode' | 'branchCode' | 'chequeNumber' | 'amount'
> & {
  customer?: string;
  sale?: string;
  partyType?: 'customer' | 'other';
  partyName?: string;
  overrideDepositLimit?: boolean;
};

/** A cheque we write from one of our bank accounts, to a supplier or any other payee. */
export type IssueChequeInput = {
  partyType: 'supplier' | 'other';
  supplier?: string;
  /** Supplier cheques only: pays this order, so its balance follows. */
  order?: string;
  payee?: string;
  bank: string;
  chequeNumber: string;
  chequeDate: string;
  amount: number;
  notes?: string;
};

export type PagedChequesParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  customer?: string;
  sale?: string;
  type?: 'all' | 'issued';
  /** Received tab: one other party by name. Issued tab: one supplier, or one other payee by name. */
  partyName?: string;
  supplier?: string;
  payee?: string;
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

/// Deposit / clear / bounce / cancel a customer cheque (transfers go through the supplier payment).
export const setChequeStatus = createAsyncThunk(
  'cheque/status',
  async (p: { id: string; status: string; note?: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = p;
      const { data } = await axiosInstance.post<Cheque>(`/cheques/${id}/status`, body);
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
    builder.addCase(setChequeStatus.fulfilled, (state, { payload }) => {
      state.items = state.items.map((i) => (i._id === payload._id ? payload : i));
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

export const issueCheque = createAsyncThunk(
  'cheque/issue',
  async (payload: IssueChequeInput, { rejectWithValue }) => {
    try {
      return (await axiosInstance.post('/cheques/issue', payload)).data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const setIssuedChequeStatus = createAsyncThunk(
  'cheque/issuedStatus',
  async (p: { id: string; status: 'CLEARED' | 'RETURNED' }, { rejectWithValue }) => {
    try {
      return (await axiosInstance.post(`/cheques/issued/${p.id}/status`, { status: p.status }))
        .data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Names of other parties used before, for the searchable pick-list. */
export const fetchChequeParties = createAsyncThunk(
  'cheque/parties',
  async (direction: 'received' | 'issued', { rejectWithValue }) => {
    try {
      return (await axiosInstance.get<string[]>('/cheques/parties', { params: { direction } }))
        .data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
