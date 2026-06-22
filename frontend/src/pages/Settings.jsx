import { useState } from 'react';
import { toast } from 'react-toastify';
import { TrashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useRecordsContext } from '../context/RecordsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Settings page: theme toggle + danger zone (delete all records).
const Settings = () => {
  const { removeAll } = useRecordsContext();
  const { theme, toggleTheme } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      const res = await removeAll();
      toast.success(`Deleted ${res.deletedCount ?? 'all'} records`);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete records');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary dark:text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage appearance and data.
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-secondary dark:text-slate-100">Appearance</h3>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary dark:text-slate-100">Dark Mode</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Toggle between light and dark themes.
            </p>
          </div>
          <button type="button" onClick={toggleTheme} className="btn-secondary">
            {theme === 'dark' ? (
              <>
                <SunIcon className="h-5 w-5" /> Light
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5" /> Dark
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card border border-red-200 dark:border-red-900/50">
        <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-secondary dark:text-slate-100">Delete All Records</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This permanently removes every record. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn-danger self-start sm:self-auto"
          >
            <TrashIcon className="h-5 w-5" /> Delete All
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete ALL records?"
        message="This will permanently delete every record in the database. This cannot be undone."
        confirmLabel="Delete Everything"
        loading={deleting}
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Settings;
