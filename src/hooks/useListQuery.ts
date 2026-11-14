import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const PAGE_SIZES = [10, 25, 50] as const;

export type SortDir = 'asc' | 'desc';

export type ListQuery = {
  page: number;
  size: number;
  q: string;
  sort: string;
  dir: SortDir;
  /** Extra filter values keyed by filter key (multi-selects arrive as arrays). */
  filters: Record<string, string>;
};

type Config = {
  filterKeys: string[];
  defaultSort: { key: string; dir: SortDir };
  sortableKeys: string[];
};

// List state lives in the URL (/customers?status=active&sort=name&page=2&size=25)
// so it survives opening a record, a refresh and a shared link.
export const useListQuery = ({ filterKeys, defaultSort, sortableKeys }: Config) => {
  const [params, setParams] = useSearchParams();
  const qRaw = params.get('q') ?? '';
  const sortRaw = params.get('sort');
  const dirRaw = params.get('dir');
  const sizeRaw = Number(params.get('size'));
  const pageRaw = Number(params.get('page'));
  const filterSig = filterKeys.map((k) => params.get(k) ?? '').join('\u0000');

  const query: ListQuery = useMemo(
    () => ({
      page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
      size: (PAGE_SIZES as readonly number[]).includes(sizeRaw) ? sizeRaw : PAGE_SIZES[0],
      q: qRaw,
      sort: sortRaw && sortableKeys.includes(sortRaw) ? sortRaw : defaultSort.key,
      dir: dirRaw === 'asc' || dirRaw === 'desc' ? dirRaw : defaultSort.dir,
      filters: Object.fromEntries(filterKeys.map((k) => [k, params.get(k) ?? ''])),
    }),
    // filterSig stands in for the filter values read from params
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageRaw, sizeRaw, sortRaw, dirRaw, qRaw, filterSig],
  );

  const patch = useCallback(
    (changes: Record<string, string | number | null>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(changes)) {
            if (v === null || v === '') next.delete(k);
            else next.set(k, String(v));
          }
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const setPage = (page: number) => patch({ page: page === 1 ? null : page });
  const setSize = (size: number) =>
    patch({ size: size === PAGE_SIZES[0] ? null : size, page: null });
  const setSort = (key: string) =>
    patch({
      sort: key,
      dir: query.sort === key && query.dir === 'asc' ? 'desc' : 'asc',
      page: null,
    });
  const applyFilters = (q: string, filters: Record<string, string>) =>
    patch({ q: q.trim() || null, ...filters, page: null });
  const clear = () =>
    patch({ q: null, page: null, ...Object.fromEntries(filterKeys.map((k) => [k, null])) });
  const hasFilters = !!query.q || Object.values(query.filters).some(Boolean);

  return { query, setPage, setSize, setSort, applyFilters, clear, hasFilters };
};
