import { useCallback, useEffect, useState } from 'react';
import * as usersApi from '@/features/users/usersApi';
import { notifyError } from '@/utils/notify';
import type { SafeUser } from '@/types/user';

const DEFAULT_LIMIT = 10;

export const useUsers = () => {
  const [data, setData] = useState<SafeUser[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await usersApi.getPaged({ page, limit });
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      notifyError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(async () => {
      if (ignore) return;
      setLoading(true);
      try {
        const result = await usersApi.getPaged({ page, limit });
        if (ignore) return;
        setData(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        if (!ignore) notifyError(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [page, limit]);

  const changeLimit = useCallback((newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  return { data, page, limit, total, totalPages, loading, setPage, setLimit: changeLimit, refetch };
};
