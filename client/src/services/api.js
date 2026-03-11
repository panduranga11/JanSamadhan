const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    // Backend sends { success: false, error: "..." }
    const message = data?.error || data?.message || response.statusText || 'Request failed';
    throw new Error(message);
  }
  // Backend sends { success: true, data: ... } — unwrap data layer
  return data?.data !== undefined ? data.data : data;
};

export const api = {
  get: (url) =>
    fetch(`${API_BASE_URL}${url}`, { headers: authHeaders() })
      .then(handleResponse),

  post: (url, body) =>
    fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (url, body) =>
    fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (url) =>
    fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),

  // multipart/form-data (for file uploads) — do NOT set Content-Type, browser does it
  postForm: (url, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(handleResponse);
  },

  putForm: (url, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(handleResponse);
  },
};
