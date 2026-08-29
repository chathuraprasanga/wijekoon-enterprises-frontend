import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { User, UserRole } from '@/store/authSlice/authSlice';

export type { User, UserRole };

type UserState = {
  items: User[];
  selected: User | null;
  page: number;
  limit: number;
  total: number;
};

const initialState: UserState = {
  items: [],
  selected: null,
  page: 1,
  limit: 10,
  total: 0,
};

export type FetchUsersParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  sortBy?:
    'firstName' | 'lastName' | 'email' | 'phone' | 'role' | 'isActive' | 'createdAt' | 'updatedAt';
  sortType?: 'asc' | 'desc';
};

type PagedUsersResponse = {
  data: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Backend only exposes a paged listing endpoint (SUPER_ADMIN only) — there is
// no unpaginated `GET /users`.
export const fetchUsers = createAsyncThunk(
  'user/fetchAll',
  async (params: FetchUsersParams | void, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedUsersResponse>('/users/paged', {
        params: params ?? {},
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<User>(`/users/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export type CreateUserPayload = {
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  role: UserRole;
};

export const createUser = createAsyncThunk(
  'user/create',
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<User>('/users', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export type UpdateUserPayload = {
  _id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export const updateUser = createAsyncThunk(
  'user/update',
  async (payload: UpdateUserPayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch<User>(`/users/${payload._id}`, payload);
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
    // Only `fulfilled` cases are wired here — pending/rejected are handled
    // globally (loading state is local to the page/component that dispatched,
    // errors are surfaced via toNotify inside the axios interceptor).
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
    });
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      state.selected = action.payload;
    });
    // create/update/delete don't mutate `items` locally — with server-driven
    // paging, the current page (and `total`) must come from a fresh
    // fetchUsers({ page, limit }) dispatch after these settle, not a local splice.
  },
});

export default userSlice.reducer;
