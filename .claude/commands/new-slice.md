---
description: Scaffold a Redux Toolkit slice for a new domain
---

Create a new Redux slice for the domain named in `$ARGUMENTS` (e.g. `/new-slice product` → `productSlice`).

## File: `src/store/<domain>Slice/<domain>Slice.ts`

```ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor.ts';
import { getErrorMessage } from '@/utils/getErrorMessage.ts';

export type <Domain> = {
  id: string;
  // ...fields
};

type <Domain>State = {
  items: <Domain>[];
  selected: <Domain> | null;
};

const initialState: <Domain>State = {
  items: [],
  selected: null,
};

export const fetch<Domain>s = createAsyncThunk('<domain>/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/<domain>s');
    return data as <Domain>[];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetch<Domain>ById = createAsyncThunk(
  '<domain>/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/<domain>s/${id}`);
      return data as <Domain>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const create<Domain> = createAsyncThunk(
  '<domain>/create',
  async (payload: Omit<<Domain>, 'id'>, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/<domain>s', payload);
      return data as <Domain>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const update<Domain> = createAsyncThunk(
  '<domain>/update',
  async (payload: <Domain>, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/<domain>s/${payload.id}`, payload);
      return data as <Domain>;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const delete<Domain> = createAsyncThunk(
  '<domain>/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/<domain>s/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const <domain>Slice = createSlice({
  name: '<domain>',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Only `fulfilled` cases are wired here — pending/rejected are handled
    // globally (loading state is local to the page/component that dispatched,
    // errors are surfaced via toNotify inside the axios interceptor).
    builder.addCase(fetch<Domain>s.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(fetch<Domain>ById.fulfilled, (state, action) => {
      state.selected = action.payload;
    });
    builder.addCase(create<Domain>.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });
    builder.addCase(update<Domain>.fulfilled, (state, action) => {
      state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
    });
    builder.addCase(delete<Domain>.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    });
  },
});

export default <domain>Slice.reducer;
```

## Register in `src/store/store.ts`

```ts
import <domain>Reducer from './<domain>Slice/<domain>Slice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    <domain>: <domain>Reducer,
  },
});
```

## Rules

- Use `axiosInstance` (not raw `axios`) — this slice's endpoints are Bearer-protected. The only slice that uses raw `axios` directly is `authSlice`, because login/refresh/forgot-password happen before there's a token.
- Every thunk catch block is `rejectWithValue(getErrorMessage(error))` — don't hand-roll error extraction.
- Don't add a `loading`/`error` flag to slice state unless multiple components need to react to it — a page dispatching one thunk should just use a local `useState<boolean>`, per the pattern in `LoginPage.tsx`/`ForgotPasswordPage.tsx`.
