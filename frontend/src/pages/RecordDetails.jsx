import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import recordService from '../services/recordService.js';
import { formatDateTime } from '../utils/format.js';

// Read-only detail view of a single record.
const RecordDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await recordService.getRecordById(id);
        if (mounted) setRecord(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load record');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await recordService.deleteRecord(id);
      toast.success('Record deleted');
      navigate('/records');
    } catch (err) {
      toast.error(err.message || 'Failed to delete record');
      setDeleting(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  if (!record)
    return (
      <EmptyState
        title="Record not found"
        message="It may have been deleted."
        action={
          <Link to="/records" className="btn-primary">
            Back to Records
          </Link>
        }
      />
    );

  const fields = [
    { label: 'ID', value: record.id ?? '-' },
    { label: 'Name', value: record.name },
    { label: 'Address', value: record.address || '-' },
    { label: 'Phone', value: record.phone || '-' },
    { label: 'Record Number', value: record.recordNo },
    { label: 'Created At', value: formatDateTime(record.createdAt) },
    { label: 'Updated At', value: formatDateTime(record.updatedAt) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back
      </button>

      <div className="card">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-700">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IdentificationIcon className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary dark:text-slate-100">{record.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">#{record.recordNo}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {f.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-secondary dark:text-slate-100">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
          <Link to={`/records/${id}/edit`} className="btn-primary">
            <PencilSquareIcon className="h-5 w-5" /> Edit
          </Link>
          <button type="button" onClick={() => setConfirmOpen(true)} className="btn-danger">
            <TrashIcon className="h-5 w-5" /> Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete record?"
        message={`This will permanently delete "${record.name}".`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default RecordDetails;
