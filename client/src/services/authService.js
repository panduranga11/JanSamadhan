import { api } from './api';

/**
 * Login with email + password
 * Returns { user, token } — backend wraps in { success, data }
 */
export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};

/**
 * Register new user
 * Backend expects { fullName, email, password }
 */
export const register = async ({ fullName, email, password }) => {
  return api.post('/auth/register', { fullName, email, password });
};

/**
 * Logout — JWT is stateless, just clear localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Google OAuth — redirect browser to backend initiation URL
 */
export const loginWithGoogle = () => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  window.location.href = `${apiBase}/auth/google`;
};
