import type { PaymentMethod } from '@/store/orderSlice/orderSlice';

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  issued_cheque: 'Our cheque',
  customer_cheque: 'Customer cheque',
};
