import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const PRODUCT_UNITS = ['ML', 'L', 'G', 'KG', 'PCS', 'BOX', 'PACK'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export type Product = {
  _id: string;
  name: string;
  sku: string;
  size: number;
  unit: ProductUnit;
  buyingPrice: number;
  sellingPrice: number;
  supplier: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagedProductsParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  supplier?: string;
  sortBy?: string;
  sortType?: string;
};

type PagedProductsResponse = {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductState = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const initialState: ProductState = {
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async (params: PagedProductsParams, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<PagedProductsResponse>('/products/paged', {
        params,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createProduct = createAsyncThunk(
  'product/create',
  async (
    payload: Pick<
      Product,
      'name' | 'sku' | 'size' | 'unit' | 'buyingPrice' | 'sellingPrice' | 'supplier'
    >,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axiosInstance.post<Product>('/products', payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateProduct = createAsyncThunk(
  'product/update',
  async (
    payload: Pick<
      Product,
      '_id' | 'name' | 'sku' | 'size' | 'unit' | 'buyingPrice' | 'sellingPrice' | 'supplier'
    > & { isActive?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const { _id, ...body } = payload;
      const { data } = await axiosInstance.patch<Product>(`/products/${_id}`, body);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    });
  },
});

export default productSlice.reducer;
