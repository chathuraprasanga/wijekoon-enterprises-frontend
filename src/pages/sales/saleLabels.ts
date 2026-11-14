import type { Customer } from '@/store/customerSlice/customerSlice';
import type { SalePaymentMethod } from '@/store/saleSlice/saleSlice';

export const PAYMENT_LABELS: Record<SalePaymentMethod, string> = {
  cash: 'Cash',
  credit: 'Credit',
  cheque: 'Cheque',
};

export const customerName = (c?: Customer) =>
  c ? `${c.firstName} ${c.lastName ?? ''}`.trim() : 'Unknown customer';
