// Dashboard statistic card.
const StatCard = ({ title, value, icon: Icon, accent = 'bg-primary/10 text-primary', loading }) => {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        ) : (
          <p className="text-2xl font-bold text-secondary dark:text-slate-100">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
