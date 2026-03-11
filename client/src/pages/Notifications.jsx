import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/complaintService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then(setNotifications)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden"
      >
        <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-brand-primary" />
            <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-brand-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 text-sm text-brand-primary hover:text-brand-primaryDark font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {error && <p className="p-4 text-sm text-red-500">{error}</p>}

        <div className="divide-y divide-border-light dark:divide-border-dark">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">You have no notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer ${
                  !n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-brand-primary' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <p className={`text-sm ${!n.is_read ? 'font-medium text-text-light dark:text-text-dark' : 'text-gray-600 dark:text-gray-400'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Notifications;
