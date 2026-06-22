// Skeleton loader rows for the records table.
const TableSkeleton = ({ rows = 8, cols = 7 }) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-card dark:bg-slate-800">
      <div className="animate-pulse divide-y divide-slate-100 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-4">
            {Array.from({ length: cols }).map((__, c) => (
              <div key={c} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
