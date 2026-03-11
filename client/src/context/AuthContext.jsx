import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, register as registerService } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { disconnectSocket } from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Pre-populate from localStorage instantly — prevents blank screen flash
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(false); // Don't block render

  useEffect(() => {
    // Silently re-validate token in the background
    const token = localStorage.getItem('token');
    if (!token) { setUser(null); return; }

    getUserProfile()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      })
      .catch(() => {
        // Token expired or invalid — sign out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  const login = async (email, password) => {
    const data = await loginService(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await registerService(userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  /** Called by OAuthCallback page after backend redirects with ?token=JWT */
  const handleOAuthToken = async (token) => {
    localStorage.setItem('token', token);
    const profile = await getUserProfile();
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = () => {
    logoutService();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    setUser(null);
  };

  const value = { user, login, register, logout, handleOAuthToken, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
