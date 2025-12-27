import api from './api';

export const transactionService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/transactions?${params}`);
    return response.data;
  },

  getById: async id => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async data => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async id => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export const categoryService = {
  getAll: async (type = '') => {
    const response = await api.get(`/categories${type ? `?type=${type}` : ''}`);
    return response.data;
  },

  create: async data => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async id => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const budgetService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/budgets?${params}`);
    return response.data;
  },

  create: async data => {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async id => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get('/budgets/alerts');
    return response.data;
  },
};

export const dashboardService = {
  getSummary: async (period = 'thisMonth') => {
    const response = await api.get(`/dashboard/summary?period=${period}`);
    return response.data;
  },

  getTrends: async months => {
    const response = await api.get(`/dashboard/trends?months=${months || 6}`);
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/dashboard/insights');
    return response.data;
  },
};
