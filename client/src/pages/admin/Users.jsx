import React from 'react';
import { User, Mail, MoreHorizontal } from 'lucide-react';

const UsersPage = () => {
    // Mock Users
    const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Citizen', status: 'Active' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Citizen', status: 'Inactive' },
        { id: 3, name: 'Charlie Admin', email: 'charlie@admin.com', role: 'Admin', status: 'Active' },
    ];

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
             <div className="p-6 border-b border-border-light dark:border-border-dark">
                <h1 className="text-xl font-bold text-text-light dark:text-text-dark">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage system users and their roles.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold mr-3">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-light dark:text-text-dark">{user.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                        user.role === 'Admin' 
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                     <span className={`flex items-center text-xs font-medium ${
                                        user.status === 'Active' ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${
                                            user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></span>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;
