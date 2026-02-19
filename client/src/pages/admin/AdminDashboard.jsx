import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark flex items-center">
        <div className={`p-4 rounded-full mr-4 ${color.bg} ${color.text}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">{value}</h3>
        </div>
    </div>
);

const AdminDashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Total Users', value: '1,234', icon: Users, color: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' } },
        { title: 'Total Complaints', value: '856', icon: FileText, color: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' } },
        { title: 'Resolved', value: '542', icon: CheckCircle, color: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' } },
        { title: 'Pending', value: '125', icon: Clock, color: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' } },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Admin Dashboard</h1>
                <div className="text-sm text-gray-500">Last updated: Just now</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Mock */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                    <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <div className="w-2 h-2 rounded-full bg-brand-primary mr-4"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New complaint registered</p>
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions Mock */}
                 <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                    <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                     <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-primary hover:text-brand-primary transition-all flex flex-col items-center justify-center text-sm font-medium text-gray-500">
                            <FileText className="w-6 h-6 mb-2" />
                            Generate Report
                        </button>
                        <button className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-primary hover:text-brand-primary transition-all flex flex-col items-center justify-center text-sm font-medium text-gray-500">
                            <Users className="w-6 h-6 mb-2" />
                            Manage Roles
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
