import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type Supplier = {
  _id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  chequeIssuedName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagedSuppliersParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedSuppliersResponse = {
  data: Supplier[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SupplierState = {
  items: Supplier[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const initialState: SupplierState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const fetchSuppliers = createAsyncThunk(
  'supplier/fetchAll',
  async (params: PagedSuppliersParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedSuppliersResponse>('/suppliers/paged', {
        params,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createSupplier = createAsyncThunk(
  'supplier/create',
  async (
    payload: Pick<Supplier, 'name' | 'phone' | 'email' | 'address' | 'chequeIssuedName'>,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axiosInstance.post<Supplier>('/suppliers', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateSupplier = createAsyncThunk(
  'supplier/update',
  async (
    payload: Pick<Supplier, '_id' | 'name' | 'phone' | 'email' | 'address' | 'chequeIssuedName'> & {
      isActive?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<Supplier>(`/suppliers/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteSupplier = createAsyncThunk(
  'supplier/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/suppliers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSuppliers.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(createSupplier.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });
    builder.addCase(updateSupplier.fulfilled, (state, action) => {
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
    });
    builder.addCase(deleteSupplier.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    });
  },
});

export default supplierSlice.reducer;
