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

type WithCheques = { cheques?: { chequeNumber: string; amount: number; status?: string }[] };

/** Cheques of the sale that came back returned: that money is unpaid again. */
export const returnedCheques = (s: WithCheques) =>
  (s.cheques ?? []).filter((c) => c.status === 'RETURNED');

/** What is still unpaid, counting returned cheques (the credit part alone is `saleOutstanding`). */
export const saleUnpaid = (
  s: Parameters<typeof saleOutstanding>[0] & WithCheques & { netTotal: number },
) =>
  Math.min(
    s.netTotal,
    saleOutstanding(s) + returnedCheques(s).reduce((sum, c) => sum + c.amount, 0),
  );

/** The cheque a payment-history line belongs to (by number, else by amount). */
export const chequeOfPayment = (
  s: WithCheques,
  p: { method: string; amount: number; reference?: string },
) =>
  p.method === 'cheque'
    ? (s.cheques ?? []).find((c) =>
        p.reference ? c.chequeNumber === p.reference : c.amount === p.amount,
      )
    : undefined;
