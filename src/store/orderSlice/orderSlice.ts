import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type OrderPaymentStatus = 'unpaid' | 'partially_paid' | 'paid';
export type OrderStatus = 'active' | 'cancelled';
export type PaymentMethod = 'cash' | 'issued_cheque' | 'customer_cheque';
export type PaymentStatus = 'completed' | 'returned' | 'reversed';

export type OrderLine = {
  product: string;
  productName: string;
  productSku: string;
  size: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  lineTotal: number;
};

export type OrderPayment = {
  _id: string;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  recordedByName?: string;
  reversalReason?: string;
  issuedCheque?: { _id: string; chequeNumber: string; chequeDate: string; status: string } | null;
  customerCheque?: {
    _id: string;
    chequeNumber: string;
    bankCode: string;
    branchCode: string;
    status: string;
  } | null;
};

/// List rows have supplier {_id, name}; the detail view adds phone/email/address and payments.
export type Order = {
  _id: string;
  orderNo: string;
  supplier: { _id: string; name: string; phone?: string; email?: string; address?: string };
  orderDate: string;
  supplierRef?: string;
  expectedDeliveryDate?: string;
  dueDate?: string;
  notes?: string;
  lineItems: OrderLine[];
  discount: number;
  tax: number;
  shipping: number;
  otherExpenses: number;
  netTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  isOverdue: boolean;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  cancelReason?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  payments?: OrderPayment[];
};

export type OrderInput = {
  supplier?: string;
  orderDate?: string;
  supplierRef?: string;
  expectedDeliveryDate?: string | null;
  dueDate?: string | null;
  notes?: string;
  lineItems?: {
    product: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  }[];
  discount?: number;
  tax?: number;
  shipping?: number;
  otherExpenses?: number;
};

export type PaymentInput = {
  method: PaymentMethod;
  amount?: number;
  paymentDate: string;
  reference?: string;
  notes?: string;
  idempotencyKey: string;
  cheque?: {
    bank: string;
    chequeNumber: string;
    chequeDate: string;
    notes?: string;
  };
  customerCheque?: string;
  transferDate?: string;
};

export type PagedOrdersParams = {
  page?: number;
  limit?: number;
  searchText?: string;
  status?: string;
  paymentStatus?: string;
  supplier?: string;
  dateFrom?: string;
  dateTo?: string;
  overdue?: string;
  sortBy?: string;
  sortType?: string;
};

export type SupplierItem = {
  _id: string;
  name: string;
  sku: string;
  size: number;
  unit: string;
  buyingPrice: number;
};

type OrderState = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
const initialState: OrderState = { items: [], page: 1, limit: 10, total: 0, totalPages: 0 };

const thunk = <A, R>(name: string, call: (arg: A) => Promise<R>) =>
  createAsyncThunk<R, A, { rejectValue: string }>(
    `order/${name}`,
    async (arg, { rejectWithValue }) => {
      try {
        return await call(arg);
      } catch (error) {
        return rejectWithValue(getErrorMessage(error));
      }
    },
  );

export const fetchOrders = thunk(
  'fetchAll',
  async (params: PagedOrdersParams) =>
    (
      await axiosInstance.get<{
        data: Order[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }>('/orders/paged', { params })
    ).data,
);
export const fetchOrderById = thunk(
  'fetchOne',
  async (id: string) => (await axiosInstance.get<Order>(`/orders/${id}`)).data,
);
export const fetchSupplierItems = thunk(
  'supplierItems',
  async (supplierId: string) =>
    (await axiosInstance.get<SupplierItem[]>(`/orders/supplier-items/${supplierId}`)).data,
);
export const createOrder = thunk(
  'create',
  async (payload: OrderInput) => (await axiosInstance.post<Order>('/orders', payload)).data,
);
export const updateOrder = thunk(
  'update',
  async ({ id, body }: { id: string; body: OrderInput }) =>
    (await axiosInstance.patch<Order>(`/orders/${id}`, body)).data,
);
export const cancelOrder = thunk(
  'cancel',
  async ({ id, reason }: { id: string; reason?: string }) =>
    (await axiosInstance.post<Order>(`/orders/${id}/cancel`, { reason })).data,
);
export const deleteOrder = thunk('delete', async (id: string) => {
  await axiosInstance.delete(`/orders/${id}`);
  return id;
});

export const createPayment = thunk(
  'payCreate',
  async ({ id, body }: { id: string; body: PaymentInput }) =>
    (await axiosInstance.post<OrderPayment>(`/orders/${id}/payments`, body)).data,
);
export const setOrderCash = thunk(
  'setCash',
  async ({ id, amount }: { id: string; amount: number }) =>
    (await axiosInstance.post<Order>(`/orders/${id}/cash`, { amount })).data,
);
export const reversePayment = thunk(
  'payReverse',
  async ({ id, reason }: { id: string; reason: string }) =>
    (await axiosInstance.post<OrderPayment>(`/payments/${id}/reverse`, { reason })).data,
);
export const setChequeStatus = thunk(
  'payChequeStatus',
  async ({ id, status, note }: { id: string; status: 'CLEARED' | 'RETURNED'; note?: string }) =>
    (await axiosInstance.post<OrderPayment>(`/payments/${id}/cheque-status`, { status, note }))
      .data,
);

export type TransferableCheque = {
  _id: string;
  chequeNumber: string;
  bankCode: string;
  branchCode: string;
  amount: number;
  depositDate: string;
  customer?: { _id: string; firstName?: string; lastName?: string };
};
export const fetchTransferableCheques = thunk<void, TransferableCheque[]>(
  'transferable',
  async () =>
    (await axiosInstance.get<TransferableCheque[]>('/payments/transferable-cheques')).data,
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.fulfilled, (state, { payload }) => {
      Object.assign(state, {
        items: payload.data,
        page: payload.page,
        limit: payload.limit,
        total: payload.total,
        totalPages: payload.totalPages,
      });
    });
    builder.addCase(deleteOrder.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((i) => i._id !== payload);
    });
  },
});

export default orderSlice.reducer;
