import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, MessageSquare, LogOut, User, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isAdmin = false }) => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const location = useLocation();

    // User requested structure:
    // Dashboard, Raise Complaint, My Complaints, Public Chat, Profile, Settings, Logout
    const menuItems = isAdmin ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'Manage Complaints', path: '/admin/complaints' },
        { icon: Users, label: 'Users', path: '/admin/users' },
    ] : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' }, // mapped to Home for now as requested "Home - Return to dashboard"
        { icon: FileText, label: 'Raise Complaint', path: '/raise-complaint' },
        { icon: FileText, label: 'My Complaints', path: '/my-complaints' },
        { icon: MessageSquare, label: 'Public Chat', path: '/chat' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 pt-16 hidden md:block z-40 transition-colors shadow-sm">
            <div className="flex flex-col h-full py-6 space-y-1">
                <div className="px-6 pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Main Menu
                    </h2>
                </div>
                
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                            isActive(item.path)
                                ? 'bg-brand-primary/5 text-brand-primary border-brand-primary'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                        }`}
                    >
                        <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? 'text-brand-primary' : 'text-gray-400'}`} />
                        {item.label}
                    </Link>
                ))}
                
                <div className="mt-auto px-6 py-6 border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={() => {
                            logout();
                            // No need to reload, state change will trigger re-render and ProtectedRoute might redirect if needed
                            // But usually we want to redirect to login explicitly
                             window.location.href = '/login';
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t('common.logout')}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
