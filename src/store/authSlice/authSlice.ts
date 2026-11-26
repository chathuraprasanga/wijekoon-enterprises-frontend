import axios, { isAxiosError } from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/utils/apiBaseUrl';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  persistRefreshToken,
  wasRefreshTokenRemembered,
} from '@/utils/authStorage';

export type AuthPermission = { module: string; action: string; key?: string };
export type AuthRole = { _id?: string; name: string; permissions: AuthPermission[] };

// The signed-in user (same account type as the tablet app). A super admin passes every permission
// check; everyone else is limited to what their roles grant (see utils/permissions.ts).
export type AuthUser = {
  _id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  avatar: string | null;
  roles: AuthRole[];
  isSuperAdmin: boolean;
  /** A time-limited demo account working on sample data; the app shows when it ends. */
  isTestUser?: boolean;
  testExpiresAt?: string | null;
  /** A generated temporary password is still in use: only change-password works until it's changed. */
  mustChangePassword?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthState = {
  user: AuthUser | null;
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
      const { data } = await axios.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>(`${API_BASE_URL}/auth/user/login`, { identifier, password });
      return { ...data, rememberMe };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return rejectWithValue(
          'The email, phone number or password is incorrect. Check them and try again, or reset your password.',
        );
      }
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { identifier: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<{ message: string }>(
        `${API_BASE_URL}/auth/user/forgot-password`,
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
        `${API_BASE_URL}/auth/user/resend-otp`,
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
        `${API_BASE_URL}/auth/user/verify-otp`,
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
        `${API_BASE_URL}/auth/user/reset-password`,
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
        `${API_BASE_URL}/auth/user/refresh`,
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
      const { data } = await axios.get<AuthUser>(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    payload: Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatar'>,
    { getState, rejectWithValue },
  ) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const { data } = await axios.patch<AuthUser>(`${API_BASE_URL}/users/me`, payload, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    payload: { currentPassword: string; newPassword: string },
    { getState, rejectWithValue },
  ) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const { data } = await axios.post<{ message: string }>(
        `${API_BASE_URL}/auth/user/change-password`,
        payload,
        { headers: { Authorization: `Bearer ${auth.accessToken}` } },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const { data } = await axios.post<{ message: string }>(
        `${API_BASE_URL}/auth/user/logout`,
        null,
        { headers: { Authorization: `Bearer ${auth.accessToken}` } },
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
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { logOut } = authSlice.actions;
export default authSlice.reducer;
