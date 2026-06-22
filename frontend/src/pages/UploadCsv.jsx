import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import uploadService from '../services/uploadService.js';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// CSV upload page with drag-and-drop, progress and result feedback.
const UploadCsv = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const validateAndSet = (selected) => {
    if (!selected) return;
    const isCsv =
      selected.name.toLowerCase().endsWith('.csv') ||
      ['text/csv', 'application/vnd.ms-excel'].includes(selected.type);
    if (!isCsv) {
      toast.error('Only .csv files are allowed');
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast.error('File too large. Maximum size is 10 MB');
      return;
    }
    setFile(selected);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warn('Please select a CSV file first');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const data = await uploadService.uploadCsv(file, setProgress);
      setResult(data);
      toast.success(
        `Upload complete: ${data.insertedCount} inserted, ${data.duplicates} duplicates skipped`
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary dark:text-slate-100">Upload CSV</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload a CSV with columns: <code>id, name, address, phone, recordNo</code>.
        </p>
      </div>

      <div className="card">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-300 hover:border-primary dark:border-slate-600'
          }`}
        >
          <ArrowUpTrayIcon className="mb-3 h-10 w-10 text-primary" />
          <p className="font-medium text-secondary dark:text-slate-100">
            Drag & drop your CSV here
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />
        </div>

        {/* Selected file */}
        {file && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium text-secondary dark:text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Remove file"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="btn-primary mt-5 w-full"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Result summary */}
      {result && (
        <div className="card border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="font-semibold text-secondary dark:text-slate-100">Upload Successful</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-emerald-600">{result.insertedCount}</span> records
                inserted ·{' '}
                <span className="font-medium text-amber-600">{result.duplicates}</span> duplicates
                skipped
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCsv;
