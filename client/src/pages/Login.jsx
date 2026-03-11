import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../services/authService';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(formData.email, formData.password);
      // Role-based redirect
      if (data?.user?.role === 'admin' || data?.user?.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Form */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
      >
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-brand-primary dark:text-brand-primary">{t('auth.loginTitle')}</h2>
            <p className="mt-2 text-sm text-text-light/70 dark:text-text-dark/70">
              {t('auth.loginSubtitle')}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark placeholder-gray-500 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark placeholder-gray-500 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="text-status-error text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-brand-primary hover:text-brand-primaryDark">
                  {t('auth.forgotPassword')}
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('common.login')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background-light dark:bg-background-dark text-gray-500">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-surface-light dark:bg-surface-dark text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                {t('auth.googleLogin')}
              </button>
            </div>
          </div>
           
           <div className="text-center mt-4">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               {t('auth.noAccount')}{' '}
               <Link to="/register" className="font-medium text-brand-primary hover:text-brand-primaryDark">
                 {t('common.register')}
               </Link>
             </p>
           </div>

        </div>
      </motion.div>

      {/* Right Side - Hero Animation */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:flex w-1/2 bg-brand-primaryDark relative overflow-hidden items-center justify-center p-12"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 text-white text-center max-w-lg">
          <motion.h1 
             className="text-5xl font-bold mb-6"
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5 }}
          >
            JanSamadhan
          </motion.h1>
          <motion.p 
            className="text-lg text-blue-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Empowering citizens with seamless grievance redressal. Connect, resolve, and improve your community.
          </motion.p>
          
          {/* Abstract Animated Shapes */}
          <motion.div 
             className="absolute -top-20 -right-20 w-64 h-64 bg-brand-accent rounded-full opacity-20 filter blur-3xl"
             animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
             transition={{ duration: 10, repeat: Infinity }}
          />
           <motion.div 
             className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-primary rounded-full opacity-20 filter blur-3xl"
             animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
             transition={{ duration: 15, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
