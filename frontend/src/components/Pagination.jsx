import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Pagination controls with page size selection.
const Pagination = ({ page, totalPages, total, limit, onPageChange, onLimitChange }) => {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of{' '}
        <span className="font-medium">{total}</span>
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Rows</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="px-2 text-sm font-medium">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
