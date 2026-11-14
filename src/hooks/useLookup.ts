import { useEffect, useState } from 'react';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Read-only reference data for selects/name columns. Kept out of Redux so it never
// clobbers a paged list's state.
// ponytail: first 100 records only, swap for async search selects past that.
export const useLookup = <T extends { _id: string }>(
  path: 'customers' | 'products' | 'sales' | 'cheques',
) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get<{ data: T[] }>(`/${path}/paged`, { params: { page: 1, limit: 100 } })
      .then(({ data }) => !cancelled && setItems(data.data))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { items, loading, error, byId: new Map(items.map((i) => [i._id, i])) };
};
