import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, XCircle, Building2, ShieldCheck } from 'lucide-react';
import { getAdminDashboard } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark flex items-center">
        <div className={`p-4 rounded-full mr-4 ${color.bg} ${color.text}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">{value ?? '—'}</h3>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        getAdminDashboard()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const dept = data?.department || user?.department;

    const stats = data ? [
        ...(isSuperAdmin ? [{ title: t('admin.totalUsers'), value: data.totalUsers, icon: Users, color: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' } }] : []),
        { title: t('dashboard.totalComplaints'), value: data.totalComplaints, icon: FileText,    color: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' } },
        { title: t('dashboard.resolved'),        value: data.resolved,        icon: CheckCircle, color: { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-600 dark:text-green-400' } },
        { title: t('dashboard.inProgress'),      value: data.inProgress,      icon: Clock,       color: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' } },
        { title: t('dashboard.pending'),         value: data.pending,         icon: Clock,       color: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' } },
        { title: t('dashboard.rejected'),        value: data.rejected,        icon: XCircle,     color: { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-600 dark:text-red-400' } },
    ] : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
                        {isSuperAdmin ? t('admin.superDashboard') : t('admin.dashboard')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {t('dashboard.welcome')}, {user?.full_name || user?.name}
                    </p>
                </div>

                {/* Department Scope Badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                    isSuperAdmin
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-brand-primary/10 text-brand-primary'
                }`}>
                    {isSuperAdmin ? <ShieldCheck size={16} /> : <Building2 size={16} />}
                    {isSuperAdmin ? t('admin.allDepartments') : (dept || 'No Department Assigned')}
                </div>
            </div>

            {/* Dept-scope info banner for regular admins */}
            {!isSuperAdmin && dept && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Building2 size={15} />
                    {t('admin.departmentOnly', { dept })}
                </div>
            )}

            {/* Stats grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                <h2 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">{t('admin.recentActivity')}</h2>
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
                    </div>
                ) : data?.recentActivity?.length > 0 ? (
                    <div className="space-y-3">
                        {data.recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <div className="w-2 h-2 rounded-full bg-brand-primary mr-4 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-text-light dark:text-text-dark">
                                        {item.action} {item.complaintTitle ? `— "${item.complaintTitle}"` : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.adminName} · {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">{t('admin.noActivity')}</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
