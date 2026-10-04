import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type Customer = {
  _id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagedCustomersParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedCustomersResponse = {
  data: Customer[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CustomerState = {
  items: Customer[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const initialState: CustomerState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const fetchCustomers = createAsyncThunk(
  'customer/fetchAll',
  async (params: PagedCustomersParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedCustomersResponse>('/customers/paged', {
        params,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createCustomer = createAsyncThunk(
  'customer/create',
  async (
    payload: Pick<Customer, 'firstName' | 'lastName' | 'email' | 'phone' | 'address'>,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axiosInstance.post<Customer>('/customers', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateCustomer = createAsyncThunk(
  'customer/update',
  async (
    payload: Pick<Customer, '_id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'address'> & {
      isActive?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<Customer>(`/customers/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/customers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(createCustomer.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });
    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
    });
    builder.addCase(deleteCustomer.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    });
  },
});

export default customerSlice.reducer;
