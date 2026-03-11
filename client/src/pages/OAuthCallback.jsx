import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Handles Google OAuth redirect: /auth/callback?token=JWT_TOKEN
 * Backend sends the user here after successful OAuth login.
 * We extract the token, fetch the user profile, then redirect to the dashboard.
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError('Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setError('No token received. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    handleOAuthToken(token)
      .then((user) => {
        if (user?.role === 'admin' || user?.role === 'super_admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      })
      .catch(() => {
        setError('Failed to complete sign-in. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <p className="text-sm text-gray-500">Redirecting you back to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
            <p className="text-text-light dark:text-text-dark font-medium">Completing Google sign-in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
