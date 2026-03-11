import { api } from './api';

// ── Categories ───────────────────────────────────────────
export const getCategories = () => api.get('/categories');

// ── User Complaints ───────────────────────────────────────
export const getComplaints = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/complaints${q ? `?${q}` : ''}`);
};

export const getComplaintById = (id) => api.get(`/complaints/${id}`);

export const createComplaint = (formData) => api.postForm('/complaints', formData);

export const editComplaint = (id, body) => api.put(`/complaints/${id}`, body);

export const rateComplaint = (id, { rating, feedback }) =>
  api.post(`/complaints/${id}/rating`, { rating, feedback });

// ── Admin Complaint Actions ───────────────────────────────
export const updateComplaintStatus = (id, { status, note }) =>
  api.put(`/complaints/${id}/status`, { status, note });

export const assignComplaint = (id, assignedTo) =>
  api.post(`/complaints/${id}/assign`, { assignedTo });

// ── Admin Dashboard ───────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard');

export const getAllComplaints = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/admin/complaints${q ? `?${q}` : ''}`);
};

export const getAllUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/admin/users${q ? `?${q}` : ''}`);
};

export const toggleBanUser = (id) => api.put(`/admin/users/${id}/ban`);

// ── Notifications ─────────────────────────────────────────
export const getNotifications = () => api.get('/notifications');

export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => api.put('/notifications/read-all');
