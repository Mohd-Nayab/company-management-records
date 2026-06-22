/**
 * Convert an array of record objects to a CSV string and trigger a download.
 */
export const exportToCsv = (records = [], filename = 'records.csv') => {
  if (!records.length) return;

  const headers = ['id', 'name', 'address', 'phone', 'recordNo', 'createdAt'];

  const escape = (value) => {
    const str = value === undefined || value === null ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((r) =>
    headers
      .map((h) => escape(h === 'createdAt' && r[h] ? new Date(r[h]).toISOString() : r[h]))
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
