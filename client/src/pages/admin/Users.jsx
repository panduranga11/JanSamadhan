import React, { useState, useEffect } from 'react';
import { getAllUsers, toggleBanUser } from '../../services/complaintService';
import { Search, ShieldOff, ShieldCheck, Loader2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [error, setError] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        getAllUsers()
            .then((res) => setUsers(res.users || []))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggleBan = async (userId) => {
        setTogglingId(userId);
        try {
            await toggleBanUser(userId);
            fetchUsers();
        } catch (e) {
            alert(e.message);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark">
                <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Manage Users</h1>
                <p className="text-sm text-gray-500 mt-1">Ban or unban citizen accounts</p>
            </div>

            {error && <p className="p-4 text-sm text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Phone</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
                            </td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4 text-sm font-medium text-text-light dark:text-text-dark">{user.full_name}</td>
                                    <td className="p-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="p-4 text-sm text-gray-500">{user.phone || '—'}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.status === 'active'   ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            user.status === 'banned'   ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'  :
                                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            disabled={togglingId === user.id}
                                            onClick={() => handleToggleBan(user.id)}
                                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                                user.status === 'banned'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                            } disabled:opacity-50`}
                                        >
                                            {togglingId === user.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : user.status === 'banned' ? (
                                                <><ShieldCheck className="w-3 h-3" /> Unban</>
                                            ) : (
                                                <><ShieldOff className="w-3 h-3" /> Ban</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
