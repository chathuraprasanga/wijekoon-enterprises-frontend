import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type Permission = {
  _id: string;
  key: string;
};

export type Role = {
  _id: string;
  name: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagedRolesParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedRolesResponse = {
  data: Role[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// The paged list endpoint populates each permission down to its `key`; the
// get-by-id endpoint (used to prefill the edit form) returns the role as
// stored, i.e. permissions as raw ids.
export type RoleDetail = {
  _id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type RoleState = {
  items: Role[];
  selected: RoleDetail | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const initialState: RoleState = {
  items: [],
  selected: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const fetchRoles = createAsyncThunk(
  'role/fetchAll',
  async (params: PagedRolesParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedRolesResponse>('/roles/paged', { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchRoleById = createAsyncThunk(
  'role/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<RoleDetail>(`/roles/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export type RolePayload = {
  name: string;
  permissions: string[];
  // Omitted entirely on create (schema defaults to true) and on update
  // (leaves the stored value untouched) — there's no UI to change it.
  isActive?: boolean;
};

export const createRole = createAsyncThunk(
  'role/create',
  async (payload: RolePayload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<RoleDetail>('/roles', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateRole = createAsyncThunk(
  'role/update',
  async (payload: RolePayload & { _id: string }, { rejectWithValue }) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<RoleDetail>(`/roles/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteRole = createAsyncThunk(
  'role/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/roles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRoles.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchRoleById.fulfilled, (state, action) => {
      state.selected = action.payload;
    });
    builder.addCase(updateRole.fulfilled, (state, action) => {
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], isActive: action.payload.isActive };
      }
    });
    builder.addCase(deleteRole.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    });
  },
});

export default roleSlice.reducer;
