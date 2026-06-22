import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleStackIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../components/StatCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CompanyCard from '../components/CompanyCard.jsx';
import recordService from '../services/recordService.js';
import { formatDateTime } from '../utils/format.js';

// Dashboard page: summary cards, search bar, company breakdown, recent uploads.
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, today: 0, recent: [] });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [statsData, companiesData] = await Promise.all([
          recordService.getStats(),
          recordService.getCompanies(),
        ]);
        if (mounted) {
          setStats(statsData);
          setCompanies(companiesData);
        }
      } catch {
        // fetch failure is non-blocking
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/records?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary dark:text-slate-100">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of your company records.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Records"
          value={stats.total}
          icon={CircleStackIcon}
          loading={loading}
        />
        <StatCard
          title="Records Today"
          value={stats.today}
          icon={CalendarDaysIcon}
          accent="bg-emerald-100 text-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Recent Uploads"
          value={stats.recent.length}
          icon={ClockIcon}
          accent="bg-amber-100 text-amber-600"
          loading={loading}
        />
      </div>

      <div className="card">
        <h3 className="mb-3 text-lg font-semibold text-secondary dark:text-slate-100">
          Quick Search
        </h3>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, address, phone or record number..."
            className="flex-1"
          />
          <button type="submit" className="btn-primary">
            Search Records
          </button>
        </form>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary dark:text-slate-100">
            Companies
          </h3>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="btn-secondary text-sm"
          >
            <ArrowUpTrayIcon className="h-4 w-4" /> Add Company CSV
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card h-24 animate-pulse bg-slate-100 dark:bg-slate-700" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            title="No companies yet"
            message="Upload a CSV file to add company records."
            action={
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload CSV
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.name} company={company} />
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary dark:text-slate-100">
            Recent Uploads
          </h3>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="btn-secondary text-sm"
          >
            <ArrowUpTrayIcon className="h-4 w-4" /> Upload CSV
          </button>
        </div>

        {!loading && stats.recent.length === 0 ? (
          <EmptyState
            title="No records yet"
            message="Upload a CSV file to get started."
            action={
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload CSV
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {(loading ? Array.from({ length: 3 }) : stats.recent).map((rec, i) => (
              <li key={rec?._id || i} className="flex items-center justify-between py-3">
                {loading ? (
                  <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-secondary dark:text-slate-100">{rec.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        #{rec.recordNo} · {formatDateTime(rec.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/records/${rec._id}`)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
