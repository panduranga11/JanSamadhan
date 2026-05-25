import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { resetPassword } from '../services/authService';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: '1 uppercase letter',    ok: /[A-Z]/.test(password) },
    { label: '1 number',              ok: /\d/.test(password) },
  ];
  return (
    <ul className="mt-1.5 space-y-1">
      {checks.map(({ label, ok }) => (
        <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-gray-300'}`} />
          {label}
        </li>
      ))}
    </ul>
  );
};

const ResetPassword = () => {
  const [params]              = useSearchParams();
  const navigate              = useNavigate();
  const token                 = params.get('token') || '';

  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState('');
  const [countdown, setCountdown]       = useState(5);

  // Redirect countdown after success
  useEffect(() => {
    if (!done) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); navigate('/login'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done, navigate]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-8">
        <div className="text-center max-w-sm">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Invalid Link</h2>
          <p className="text-sm text-gray-500 mb-6">This password reset link is missing or malformed.</p>
          <Link to="/forgot-password" className="text-brand-primary font-semibold hover:underline">
            Request a new reset link →
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords don't match.");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return setError('Password must be at least 8 characters with 1 uppercase and 1 number.');
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left — Form */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background-light dark:bg-background-dark"
      >
        <div className="max-w-md w-full space-y-8">
          <AnimatePresence mode="wait">
            {!done ? (
              /* ── Set new password form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-4">
                    <Lock className="text-brand-primary" size={28} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-brand-primary">Set New Password</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Choose a strong password you haven't used before.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="rp-password"
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New password"
                        className="appearance-none rounded-lg block w-full pl-10 pr-10 py-2.5 border border-border-light dark:border-border-dark placeholder-gray-400 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {password && <PasswordStrength password={password} />}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="rp-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirm new password"
                        className={`appearance-none rounded-lg block w-full pl-10 pr-10 py-2.5 border placeholder-gray-400 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-sm transition ${
                          confirm && confirm !== password
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-border-light dark:border-border-dark focus:border-brand-primary'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-lg"
                      >
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        {error}
                        {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid') ? (
                          <Link to="/forgot-password" className="ml-1 underline hover:text-brand-primary whitespace-nowrap">
                            Get a new link
                          </Link>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading || !password || password !== confirm}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                    {loading ? 'Updating...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>

            ) : (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto"
                >
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={40} />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Password Updated!
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Your password has been changed successfully.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-300">
                  Redirecting to login in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}…
                </div>

                <Link
                  to="/login"
                  className="inline-block text-sm font-medium text-brand-primary hover:text-brand-primaryDark transition-colors"
                >
                  Go to Login now →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right — Decorative panel */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:flex w-1/2 bg-brand-primaryDark relative overflow-hidden items-center justify-center p-12"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 text-white text-center max-w-lg">
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            New Beginning
          </motion.h1>
          <motion.p
            className="text-lg text-blue-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Your new password is encrypted with industry-standard bcrypt. Once set, your old
            reset link becomes invalid and can never be used again.
          </motion.p>
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

export default ResetPassword;
