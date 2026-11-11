import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally – redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bv_token');
      localStorage.removeItem('bv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Onboarding
export const onboardingApi = {
  submit: (data) => api.post('/onboarding', data),
  getStatus: () => api.get('/onboarding/status'),
};

// Accounts
export const accountApi = {
  getMyAccounts: () => api.get('/accounts'),
  getAccount: (id) => api.get(`/accounts/${id}`),
};

// Transfers
export const transferApi = {
  transfer: (data) => api.post('/transfers', data),
  getMyTransactions: (params) => api.get('/transfers', { params }),
  getTransaction: (id) => api.get(`/transfers/${id}`),
};

// Ledger
export const ledgerApi = {
  getMyLedger: (params) => api.get('/ledger', { params }),
  getLedgerByTransaction: (txId) => api.get(`/ledger/${txId}`),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getOnboardings: (params) => api.get('/admin/onboarding', { params }),
  reviewOnboarding: (id, data) => api.patch(`/admin/onboarding/${id}`, data),
  getAccounts: (params) => api.get('/admin/accounts', { params }),
  updateAccountStatus: (id, data) => api.patch(`/admin/accounts/${id}/status`, data),
  verifyLedger: () => api.get('/admin/ledger/verify'),
};

export default api;
