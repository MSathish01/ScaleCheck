import axios from 'axios';

export const API_BASE = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach Authorization JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scalecheck_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getOfficers: (params?: any) => api.get('/auth/officers', { params })
};

export const instrumentApi = {
  create: (data: any) => api.post('/instruments', data),
  getMy: () => api.get('/instruments/my'),
  getAll: (params?: any) => api.get('/instruments/all', { params }),
  getById: (id: string) => api.get(`/instruments/${id}`)
};

export const applicationApi = {
  submit: (data: any) => api.post('/applications', data),
  getMy: () => api.get('/applications/my'),
  getAllocated: () => api.get('/applications/allocated'),
  getAll: (params?: any) => api.get('/applications/all', { params }),
  allocate: (data: any) => api.post('/applications/allocate', data),
  schedule: (data: any) => api.post('/applications/schedule', data)
};

export const inspectionApi = {
  record: (data: any) => api.post('/inspections/record', data),
  syncOffline: (inspections: any[]) => api.post('/inspections/sync-offline', { inspections })
};

export const certificateApi = {
  publicVerify: (certId: string) => api.get(`/certificates/verify/${certId}`),
  issue: (data: any) => api.post('/certificates/issue', data),
  downloadPdfUrl: (certId: string) => `${API_BASE}/certificates/${certId}/pdf`
};

export const ledgerApi = {
  getLedger: (limit = 50) => api.get(`/ledger?limit=${limit}`),
  validateChain: () => api.get('/ledger/validate'),
  simulateTamper: (sequence = 2) => api.post('/ledger/simulate-tamper', { sequence }),
  repairChain: () => api.post('/ledger/repair-chain', {})
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPublicKey: () => api.get('/analytics/public-key'),
  getNotifications: () => api.get('/analytics/notifications')
};

export default api;
