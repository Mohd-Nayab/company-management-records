import api from './api.js';

/**
 * Service for uploading CSV files with progress tracking.
 */
const uploadService = {
  // Upload a CSV file. onProgress receives a 0-100 percentage.
  uploadCsv: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
    return data;
  },
};

export default uploadService;
