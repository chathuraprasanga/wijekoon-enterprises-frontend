import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const ACCOUNT_TYPES = ['Current', 'Savings', 'Other'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

/// Lists carry accountNumberMasked only; the full accountNumber comes from GET /banks/:id.
export type Bank = {
  _id: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  accountNumber?: string;
  accountNumberMasked?: string;
  accountName: string;
  accountType: AccountType;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type BankInput = {
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  isActive: boolean;
  notes?: string;
};

export type IssuedCheque = {
  _id: string;
  chequeNumber: string;
  chequeDate: string;
  amount: number;
  status: 'ISSUED' | 'CLEARED' | 'RETURNED';
  supplier?: { _id: string; name: string };
  order?: { _id: string; orderNo: string };
};

export type PagedBanksParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  accountType?: string;
  sortBy?: string;
  sortType?: string;
};

type BankState = { items: Bank[]; page: number; limit: number; total: number; totalPages: number };
const initialState: BankState = { items: [], page: 1, limit: 10, total: 0, totalPages: 0 };

const thunk = <A, R>(name: string, call: (arg: A) => Promise<R>) =>
  createAsyncThunk<R, A, { rejectValue: string }>(
    `bank/${name}`,
    async (arg, { rejectWithValue }) => {
      try {
        return await call(arg);
      } catch (error) {
        return rejectWithValue(getErrorMessage(error));
      }
    },
  );

export const fetchBanks = thunk(
  'fetchAll',
  async (params: PagedBanksParams) =>
    (
      await axiosInstance.get<{
        data: Bank[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }>('/banks/paged', { params })
    ).data,
);
export const fetchBankById = thunk(
  'fetchOne',
  async (id: string) => (await axiosInstance.get<Bank>(`/banks/${id}`)).data,
);
export const fetchBankActivity = thunk(
  'activity',
  async (id: string) =>
    (await axiosInstance.get<{ issuedCheques: IssuedCheque[] }>(`/banks/${id}/activity`)).data,
);
export const createBank = thunk(
  'create',
  async (payload: BankInput) => (await axiosInstance.post<Bank>('/banks', payload)).data,
);
export const updateBank = thunk(
  'update',
  async ({ _id, ...body }: Partial<BankInput> & { _id: string }) =>
    (await axiosInstance.patch<Bank>(`/banks/${_id}`, body)).data,
);
export const deleteBank = thunk('delete', async (id: string) => {
  await axiosInstance.delete(`/banks/${id}`);
  return id;
});

const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBanks.fulfilled, (state, { payload }) => {
      Object.assign(state, {
        items: payload.data,
        page: payload.page,
        limit: payload.limit,
        total: payload.total,
        totalPages: payload.totalPages,
      });
    });
    builder.addCase(deleteBank.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((i) => i._id !== payload);
    });
  },
});

export default bankSlice.reducer;
