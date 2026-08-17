import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/utils/apiBaseUrl';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'SALES_MANAGER';

export type User = {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: localStorage.getItem('refreshToken'),
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<{ user: User; accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/login`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { identifier: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<{ message: string }>(
        `${API_BASE_URL}/auth/forgot-password`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { identifier: string; code: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<{ message: string; resetToken: string }>(
        `${API_BASE_URL}/auth/verify-otp`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    payload: { identifier: string; resetToken: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post<{ message: string }>(
        `${API_BASE_URL}/auth/reset-password`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const tokenRefresh = createAsyncThunk(
  'auth/tokenRefresh',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken: auth.refreshToken },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    });
    builder.addCase(tokenRefresh.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    });
  },
});

export const { logOut } = authSlice.actions;
export default authSlice.reducer;
