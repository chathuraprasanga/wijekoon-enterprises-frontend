import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/utils/apiBaseUrl';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  persistRefreshToken,
  wasRefreshTokenRemembered,
} from '@/utils/authStorage';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'SALES_MANAGER';

export type User = {
  _id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: getStoredRefreshToken(),
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    payload: { identifier: string; password: string; rememberMe: boolean },
    { rejectWithValue },
  ) => {
    try {
      const { identifier, password, rememberMe } = payload;
      const { data } = await axios.post<{ user: User; accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/login`,
        { identifier, password },
      );
      return { ...data, rememberMe };
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

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (payload: { identifier: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<{ message: string }>(
        `${API_BASE_URL}/auth/resend-otp`,
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

// Uses plain axios with a manual Authorization header (not axiosInstance) to avoid a
// circular import: axiosInstance's interceptor imports the store, which imports this slice.
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const { data } = await axios.get<User>(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
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
      clearStoredRefreshToken();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persistRefreshToken(action.payload.refreshToken, action.payload.rememberMe);
    });
    builder.addCase(tokenRefresh.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persistRefreshToken(action.payload.refreshToken, wasRefreshTokenRemembered());
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { logOut } = authSlice.actions;
export default authSlice.reducer;
