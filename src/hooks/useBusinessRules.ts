import { useEffect, useState } from 'react';
import { axiosInstance } from '@/interceptors/axiosInterceptor';

/// Whole calendar days, set under Settings → Business rules (GET /settings/rules, any signed-in user).
export type BusinessRules = {
  depositClearingDays: number;
  transferClearingDays: number;
  issuedClearingDays: number;
  saleDueDays: number;
  orderDueDays: number;
  chequeMaxDepositDays: number;
  /** true: a later deposit date is refused outright, no override. */
  chequeStrictDeposit: boolean;
};

export const DEFAULT_RULES: BusinessRules = {
  depositClearingDays: 2,
  transferClearingDays: 2,
  issuedClearingDays: 2,
  saleDueDays: 30,
  orderDueDays: 30,
  chequeMaxDepositDays: 90,
  chequeStrictDeposit: false,
};

let cache: BusinessRules | null = null;
const listeners = new Set<(r: BusinessRules) => void>();

/// Re-reads the rules and tells every mounted form (call after saving the settings).
export const refreshBusinessRules = async () => {
  const { data } = await axiosInstance.get<BusinessRules>('/settings/rules');
  cache = { ...DEFAULT_RULES, ...data };
  listeners.forEach((l) => l(cache!));
  return cache;
};

/// The current rules (defaults until the first load lands). Forms re-derive their date defaults when
/// these change, until the user edits the date themselves.
export const useBusinessRules = () => {
  const [rules, setRules] = useState<BusinessRules>(cache ?? DEFAULT_RULES);
  useEffect(() => {
    listeners.add(setRules);
    refreshBusinessRules().catch(() => undefined); // keep the defaults if it fails
    return () => {
      listeners.delete(setRules);
    };
  }, []);
  return rules;
};

/// `YYYY-MM-DD` of [from] (a date or YYYY-MM-DD, default today) plus [days], in local time.
export const ymdPlusDays = (days: number, from?: string | Date | null) => {
  const d = from
    ? new Date(typeof from === 'string' ? `${from.slice(0, 10)}T00:00:00` : from)
    : new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
