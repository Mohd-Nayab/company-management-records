import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../utils/format.js';

/**
 * TanStack Table for displaying company records.
 * Sorting is client-side; pagination & search are server-side (handled by parent).
 */
const RecordsTable = ({ records, sorting, onSortingChange, onView, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => info.getValue() ?? '-',
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'recordNo',
        header: 'Record Number',
        cell: (info) => (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created Date',
        cell: (info) => formatDate(info.getValue()),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (onView ? onView(row.original) : navigate(`/records/${row.original._id}`))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700"
              title="View"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => (onEdit ? onEdit(row.original) : navigate(`/records/${row.original._id}/edit`))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-700"
              title="Edit"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row.original)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: records,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-card dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1 ${canSort ? 'cursor-pointer select-none' : 'cursor-default'}`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="flex flex-col">
                          {sorted === 'asc' ? (
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          ) : sorted === 'desc' ? (
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronUpIcon className="h-3.5 w-3.5 opacity-30" />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/40"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;
