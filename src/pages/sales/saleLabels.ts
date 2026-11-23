import type { Customer } from '@/store/customerSlice/customerSlice';
import type { SalePaymentMethod } from '@/store/saleSlice/saleSlice';

export const PAYMENT_LABELS: Record<SalePaymentMethod, string> = {
  cash: 'Cash',
  credit: 'Credit',
  cheque: 'Cheque',
  split: 'Split',
};

export const customerName = (c?: Customer) =>
  c ? `${c.firstName} ${c.lastName ?? ''}`.trim() : 'Unknown customer';

/** What the customer still owes: the credit part of the sale. */
export const saleOutstanding = (s: { payments?: { method: string; amount: number }[] }) =>
  s.payments?.find((p) => p.method === 'credit')?.amount ?? 0;
