import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, MessageSquare, LogOut, User, Settings, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isAdmin = false }) => {
    const { t } = useTranslation();
    const { logout, user } = useAuth();
    const location = useLocation();

    const adminMenuItems = [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'),         path: '/admin' },
        { icon: FileText,        label: t('sidebar.manageComplaints'),  path: '/admin/complaints' },
        { icon: Users,           label: t('sidebar.users'),             path: '/admin/users' },
        ...(user?.role === 'super_admin'
            ? [{ icon: ShieldCheck, label: t('sidebar.manageAdmins'), path: '/admin/admins' }]
            : []),
    ];

    const userMenuItems = [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'),      path: '/' },
        { icon: FileText,        label: t('sidebar.raiseComplaint'), path: '/raise-complaint' },
        { icon: FileText,        label: t('sidebar.myComplaints'),   path: '/my-complaints' },
        { icon: MessageSquare,   label: t('sidebar.publicChat'),     path: '/chat' },
        { icon: User,            label: t('sidebar.profile'),        path: '/profile' },
        { icon: Settings,        label: t('sidebar.settings'),       path: '/settings' },
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 pt-16 hidden md:block z-40 transition-colors shadow-sm">
            <div className="flex flex-col h-full py-6 space-y-1">
                <div className="px-6 pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {t('sidebar.mainMenu')}
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
                        {t('sidebar.logout')}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
