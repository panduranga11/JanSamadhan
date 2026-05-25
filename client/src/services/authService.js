import { api } from './api';

/** Login with email + password */
export const login = async (email, password) => api.post('/auth/login', { email, password });

/** Register new user */
export const register = async ({ fullName, email, password }) =>
  api.post('/auth/register', { fullName, email, password });

/** Logout — JWT is stateless, just clear localStorage */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/** Google OAuth — redirect browser to backend initiation URL */
export const loginWithGoogle = () => {
  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
  window.location.href = `${apiBase}/auth/google`;
};

/**
 * Forgot Password — send reset email.
 * Backend always returns 200 regardless of whether email exists.
 */
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

/**
 * Reset Password — submit new password with the token from the email link.
 */
export const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password });
