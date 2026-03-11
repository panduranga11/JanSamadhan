import { api } from './api';

// ── Admins ────────────────────────────────────────────────
export const listAdmins       = ()           => api.get('/superadmin/admins');
export const createAdmin      = (body)       => api.post('/superadmin/admins', body);
export const updateAdmin      = (id, body)   => api.put(`/superadmin/admins/${id}`, body);
export const deleteAdmin      = (id)         => api.delete(`/superadmin/admins/${id}`);

// ── Categories ────────────────────────────────────────────
export const listCategories   = ()           => api.get('/superadmin/categories');
export const addCategory      = (body)       => api.post('/superadmin/categories', body);

// ── Analytics & Logs ─────────────────────────────────────
export const getAnalytics     = ()           => api.get('/superadmin/analytics');
export const getSuperAdminLogs = (params={}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/superadmin/logs${q ? `?${q}` : ''}`);
};
