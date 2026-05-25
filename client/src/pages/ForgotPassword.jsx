import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPassword } from '../services/authService';

const ForgotPassword = () => {
  const [params]          = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address.');
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      // Only show real validation errors (e.g. invalid email format)
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

          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={15} /> Back to Login
          </Link>

          <AnimatePresence mode="wait">
            {!sent ? (
              /* ── Request form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-4">
                    <Mail className="text-brand-primary" size={28} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-brand-primary">Forgot Password?</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No worries — enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="appearance-none rounded-lg block w-full pl-10 pr-4 py-2.5 border border-border-light dark:border-border-dark placeholder-gray-400 text-gray-900 dark:text-white dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-sm transition"
                    />
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                    {loading ? 'Sending...' : 'Send Reset Link'}
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
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Check your inbox</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    If <span className="font-semibold text-brand-primary">{email}</span> is registered,
                    a reset link has been sent. It expires in <strong>15 minutes</strong>.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300 text-left space-y-1">
                  <p className="font-semibold">Didn't get it?</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you used the correct email</li>
                    <li>
                      <button
                        onClick={() => { setSent(false); setEmail(''); }}
                        className="underline hover:text-brand-primary transition-colors"
                      >
                        Try again with a different email
                      </button>
                    </li>
                  </ul>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primaryDark transition-colors"
                >
                  <ArrowLeft size={15} /> Return to Login
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
            Account Recovery
          </motion.h1>
          <motion.p
            className="text-lg text-blue-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            We take your security seriously. Your reset link is encrypted, one-time use,
            and expires in 15 minutes.
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

export default ForgotPassword;
