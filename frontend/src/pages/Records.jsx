import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowDownTrayIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import RecordsTable from '../components/RecordsTable.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useRecordsContext } from '../context/RecordsContext.jsx';
import { exportToCsv } from '../utils/exportCsv.js';

// Records listing page with server-side pagination/search and client-side sorting.
const Records = () => {
  const {
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
  } = useRecordsContext();

  const [searchParams] = useSearchParams();
  const [sorting, setSorting] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef(null);
  const initRef = useRef(false);

  // Seed search from URL query param (e.g. coming from dashboard).
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced fetch whenever search/page/limit changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = initRef.current ? 350 : 0;
    debounceRef.current = setTimeout(() => {
      fetchRecords({ page, limit, search }).catch(() => {});
      initRef.current = true;
    }, delay);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  const handleSearchChange = useCallback(
    (value) => {
      setSearch(value);
      setPage(1);
    },
    [setSearch, setPage]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeRecord(deleteTarget._id);
      toast.success('Record deleted');
      setDeleteTarget(null);
      // If we just deleted the last record on a page beyond the first,
      // step back a page; otherwise refetch the current page.
      const wasLastOnPage = records.length === 1 && page > 1;
      const nextPage = wasLastOnPage ? page - 1 : page;
      if (wasLastOnPage) setPage(nextPage);
      else fetchRecords({ page, limit, search }).catch(() => {});
    } catch (err) {
      toast.error(err.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    if (!records.length) {
      toast.warn('No records to export');
      return;
    }
    exportToCsv(records, `records-page-${page}.csv`);
    toast.success('Exported current page to CSV');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary dark:text-slate-100">Records</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{total} total records</p>
        </div>
        <button type="button" onClick={handleExport} className="btn-secondary self-start sm:self-auto">
          <ArrowDownTrayIcon className="h-5 w-5" /> Export CSV
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder="Search by name, address, phone or record number..."
      />

      {loading ? (
        <TableSkeleton rows={limit > 10 ? 10 : limit} />
      ) : error ? (
        <EmptyState title="Something went wrong" message={error} icon={TableCellsIcon} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No records found"
          message={search ? 'Try a different search term.' : 'Upload a CSV to add records.'}
          icon={TableCellsIcon}
        />
      ) : (
        <div className="space-y-1">
          <RecordsTable
            records={records}
            sorting={sorting}
            onSortingChange={setSorting}
            onDelete={setDeleteTarget}
          />
          <div className="rounded-xl bg-white shadow-card dark:bg-slate-800">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(n) => {
                setLimit(n);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete record?"
        message={`This will permanently delete "${deleteTarget?.name}" (#${deleteTarget?.recordNo}).`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Records;
