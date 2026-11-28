/** Plain colours only; every series is also named in its legend and tooltip. */
export type Kind = 'solid' | 'blue' | 'stripe' | 'dots' | 'diag' | 'cross' | 'grey';

export const KIND_BASE: Record<Kind, string> = {
  solid: 'var(--ldg-accent)',
  blue: 'var(--ldg-info-fill)',
  stripe: 'var(--ldg-info-fill)',
  dots: 'var(--ldg-warning-fill)',
  diag: 'var(--ldg-warning-fill)',
  cross: 'var(--ldg-danger-fill)',
  grey: 'var(--ldg-text-subtle)',
};

export const fillOf = (k: Kind) => KIND_BASE[k];

export const SALE_STATUS: Record<string, { label: string; kind: Kind }> = {
  paid: { label: 'Paid', kind: 'solid' },
  partially_paid: { label: 'Partially paid', kind: 'dots' },
  not_paid: { label: 'Unpaid', kind: 'cross' },
};
export const PAY_METHOD: Record<string, { label: string; kind: Kind }> = {
  cash: { label: 'Cash', kind: 'solid' },
  credit: { label: 'Credit', kind: 'stripe' },
  cheque: { label: 'Cheque', kind: 'dots' },
};
export const CHEQUE_STATUS: { status: string; label: string; kind: Kind }[] = [
  { status: 'RECEIVED', label: 'Received', kind: 'blue' },
  { status: 'DEPOSITED', label: 'Deposited', kind: 'diag' },
  { status: 'CLEARED', label: 'Cleared', kind: 'solid' },
  { status: 'TRANSFERRED', label: 'Transferred', kind: 'grey' },
  { status: 'RETURNED', label: 'Returned', kind: 'cross' },
];
