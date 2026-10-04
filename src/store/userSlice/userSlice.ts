import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type User = {
  _id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  address: string | null;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagedUsersParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedUsersResponse = {
  data: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UserState = {
  items: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const initialState: UserState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const fetchUsers = createAsyncThunk(
  'user/fetchAll',
  async (params: PagedUsersParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedUsersResponse>('/users/paged', { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createUser = createAsyncThunk(
  'user/create',
  async (
    payload: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'roles'>,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axiosInstance.post<User>('/users', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (
    payload: Pick<
      User,
      '_id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'roles'
    > & { isActive?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<User>(`/users/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteUser = createAsyncThunk(
  'user/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    });
  },
});

export default userSlice.reducer;
