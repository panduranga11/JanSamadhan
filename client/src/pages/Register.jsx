import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', city: '' });
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error)       { setError(''); }
    if (emailExists) { setEmailExists(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    setLoading(true);
    setError('');
    setEmailExists(false);
    try {
      await register(formData);
      navigate('/'); 
    } catch (err) {
      const msg = err.message || 'Registration failed';
      if (msg.toLowerCase().includes('already registered') ||
          msg.toLowerCase().includes('already in use') || err.status === 409) {
        setEmailExists(true);
      } else {
        setError(msg);
      }
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
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-brand-primary dark:text-brand-primary">{t('auth.registerTitle')}</h2>
            <p className="mt-2 text-sm text-text-light/70 dark:text-text-dark/70">
              {t('auth.registerSubtitle')}
            </p>
          </div>
          
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              
              {/* Full Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark placeholder-gray-500 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.fullName')}
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

               {/* City/Area */}
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark placeholder-gray-500 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                  placeholder="Area / City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="relative">
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

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark placeholder-gray-500 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark placeholder-gray-500 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.confirmPassword')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email already exists banner */}
            {emailExists && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={15} />
                <div className="text-amber-700 dark:text-amber-300 text-sm">
                  <p className="font-semibold">An account with this email already exists.</p>
                  <p className="text-xs mt-0.5">
                    <Link to="/login" className="underline font-semibold hover:text-brand-primary">Log in</Link>
                    {' '}to your account, or{' '}
                    <Link
                      to={`/forgot-password?email=${encodeURIComponent(formData.email)}`}
                      className="underline font-semibold hover:text-brand-primary"
                    >
                      reset your password
                    </Link>{' '}if you've forgotten it.
                  </p>
                </div>
              </div>
            )}

            {/* Generic error */}
            {error && (
              <div className="text-status-error text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50"
              >
                 {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('common.register')}
              </button>
            </div>
          </form>

           <div className="text-center mt-4">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               {t('auth.hasAccount')}{' '}
               <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primaryDark">
                 {t('common.login')}
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
             className="text-4xl font-bold mb-6"
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.5 }}
          >
            Join JanSamadhan Today
          </motion.h1>
          <motion.p 
            className="text-lg text-blue-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Create an account to track complaints, communicate with officials, and make your voice heard.
          </motion.p>
          
           {/* Abstract Animated Shapes (Different from Login) */}
           <motion.div 
             className="absolute top-10 left-10 w-40 h-40 bg-brand-accent rounded-full opacity-20 filter blur-3xl"
             animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
             transition={{ duration: 8, repeat: Infinity }}
          />
           <motion.div 
             className="absolute bottom-10 right-10 w-60 h-60 bg-brand-primary rounded-full opacity-30 filter blur-3xl"
             animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
             transition={{ duration: 12, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
