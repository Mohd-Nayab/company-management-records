import { InboxIcon } from '@heroicons/react/24/outline';

// Generic empty-state placeholder.
const EmptyState = ({ title = 'No data found', message = '', icon: Icon = InboxIcon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
      <Icon className="mb-4 h-12 w-12 text-slate-400" />
      <h3 className="text-lg font-semibold text-secondary dark:text-slate-100">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
