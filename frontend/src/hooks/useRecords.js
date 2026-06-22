import { useCallback, useState } from 'react';
import recordService from '../services/recordService.js';

/**
 * Custom hook encapsulating records list state: fetching, pagination,
 * search, and mutations. Shared app-wide via RecordsContext.
 */
const useRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch records using explicit params (falls back to current state).
  const fetchRecords = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await recordService.getRecords({
          page: params.page ?? page,
          limit: params.limit ?? limit,
          search: params.search ?? search,
        });
        setRecords(data.records);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
        return data;
      } catch (err) {
        setError(err.message);
        setRecords([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  const removeRecord = useCallback(async (id) => {
    await recordService.deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r._id !== id));
    setTotal((t) => Math.max(t - 1, 0));
  }, []);

  const removeAll = useCallback(async () => {
    const res = await recordService.deleteAllRecords();
    setRecords([]);
    setTotal(0);
    setTotalPages(1);
    setPage(1);
    return res;
  }, []);

  return {
    records,
    loading,
    error,
    page,
    limit,
    search,
    total,
    totalPages,
    setPage,
    setLimit,
    setSearch,
    fetchRecords,
    removeRecord,
    removeAll,
  };
};

export default useRecords;
