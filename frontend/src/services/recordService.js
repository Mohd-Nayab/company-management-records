import api from './api.js';

/**
 * Service layer for record CRUD + stats operations.
 */
const recordService = {
  // Get paginated records with optional search.
  getRecords: async ({ page = 1, limit = 10, search = '' } = {}) => {
    const { data } = await api.get('/records', {
      params: { page, limit, search },
    });
    return data;
  },

  // Dashboard statistics.
  getStats: async () => {
    const { data } = await api.get('/records/stats');
    return data.stats;
  },

  // Records grouped by company name.
  getCompanies: async () => {
    const { data } = await api.get('/records/companies');
    return data.companies;
  },

  // Single record by id.
  getRecordById: async (id) => {
    const { data } = await api.get(`/records/${id}`);
    return data.record;
  },

  // Update a record.
  updateRecord: async (id, payload) => {
    const { data } = await api.put(`/records/${id}`, payload);
    return data.record;
  },

  // Delete a single record.
  deleteRecord: async (id) => {
    const { data } = await api.delete(`/records/${id}`);
    return data;
  },

  // Delete all records.
  deleteAllRecords: async () => {
    const { data } = await api.delete('/records');
    return data;
  },
};

export default recordService;
