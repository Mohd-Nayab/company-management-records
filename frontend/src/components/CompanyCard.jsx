import { useNavigate } from 'react-router-dom';
import { BuildingOffice2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '../utils/format.js';

// Dashboard card representing one company and its record count.
// Clicking it opens the Records page filtered to that company,
// where records can be viewed, edited or deleted.
const CompanyCard = ({ company }) => {
  const navigate = useNavigate();

  const open = () => navigate(`/records?search=${encodeURIComponent(company.name)}`);

  return (
    <button
      type="button"
      onClick={open}
      className="card group flex w-full items-center gap-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BuildingOffice2Icon className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-secondary dark:text-slate-100">
          {company.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Updated {formatDateTime(company.lastUpdated)}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-2xl font-bold text-secondary dark:text-slate-100">
          {company.count}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-slate-400">records</span>
      </div>

      <ArrowRightIcon className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
};

export default CompanyCard;
