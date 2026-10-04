import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type Permission = {
  _id: string;
  module: string;
  action: string;
  key: string;
};

type PermissionState = {
  items: Permission[];
};

const initialState: PermissionState = {
  items: [],
};

export const fetchPermissions = createAsyncThunk(
  'permission/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<Permission[]>('/permissions');
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPermissions.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export default permissionSlice.reducer;
