import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import recordService from '../services/recordService.js';

// Edit page: loads record, pre-fills the form, submits update.
const EditRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await recordService.getRecordById(id);
        if (mounted) {
          reset({
            id: data.id ?? '',
            name: data.name ?? '',
            address: data.address ?? '',
            phone: data.phone ?? '',
            recordNo: data.recordNo ?? '',
          });
        }
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        id: values.id === '' ? undefined : Number(values.id),
      };
      await recordService.updateRecord(id, payload);
      toast.success('Record updated successfully');
      navigate(`/records/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update record');
    }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  if (notFound)
    return (
      <EmptyState
        title="Record not found"
        action={
          <Link to="/records" className="btn-primary">
            Back to Records
          </Link>
        }
      />
    );

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
        <h2 className="mb-6 text-xl font-bold text-secondary dark:text-slate-100">Edit Record</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">ID</label>
              <input
                type="number"
                className="input"
                {...register('id', {
                  validate: (v) =>
                    v === '' || !Number.isNaN(Number(v)) || 'ID must be a number',
                })}
              />
              {errors.id && <p className="mt-1 text-xs text-red-600">{errors.id.message}</p>}
            </div>

            <div>
              <label className="label">Record Number *</label>
              <input
                type="text"
                className="input"
                {...register('recordNo', { required: 'Record number is required' })}
              />
              {errors.recordNo && (
                <p className="mt-1 text-xs text-red-600">{errors.recordNo.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              className="input"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Address</label>
            <input type="text" className="input" {...register('address')} />
          </div>

          <div>
            <label className="label">Phone</label>
            <input type="text" className="input" {...register('phone')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to={`/records/${id}`} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecord;
