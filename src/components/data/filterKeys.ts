import type { FilterField } from './ListToolbar';

/// The query keys a filter owns (a date range owns two).
export const filterKeys = (f: FilterField) =>
  f.type === 'dateRange' ? [f.fromKey, f.toKey] : [f.key];
