import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '@/features/auth/authApi';
import { clearTokens, getAccessToken, setTokens } from '@/api/tokenStorage';
import { getApiErrorMessage } from '@/api/errors';
import type { SafeUser } from '@/types/user';

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  bootstrapped: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  bootstrapped: false,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: authApi.LoginPayload, { rejectWithValue }) => {
    try {
      const { user, accessToken, refreshToken } = await authApi.login(payload);
      setTokens({ accessToken, refreshToken });
      return user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchMeThunk = createAsyncThunk(
  'auth/fetchMe',
  async (_: void, { rejectWithValue }) => {
    try {
      return await authApi.getMe();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const bootstrapAuthThunk = createAsyncThunk(
  'auth/bootstrap',
  async (_: void, { dispatch }) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return null;
    }
    const result = await dispatch(fetchMeThunk());
    return fetchMeThunk.fulfilled.match(result) ? result.payload : null;
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    clearTokens();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutLocal: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    setUser: (state, action: PayloadAction<SafeUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Login failed';
        state.isAuthenticated = false;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(bootstrapAuthThunk.fulfilled, (state) => {
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuthThunk.rejected, (state) => {
        state.bootstrapped = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { logoutLocal, setUser } = authSlice.actions;
export default authSlice.reducer;
