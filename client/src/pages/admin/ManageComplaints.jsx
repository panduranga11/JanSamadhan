import React, { useState, useEffect } from 'react';
import { getComplaints } from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import { Search, Filter, MoreVertical, Check, X } from 'lucide-react';

const ManageComplaints = () => {
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        // In a real app, we might fetch all complaints specifically for admin
        getComplaints().then(setComplaints); 
    }, []);

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
             <div className="p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Manage Complaints</h1>
                
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search complaints..." 
                            className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border-none focus:ring-1 focus:ring-brand-primary outline-none w-full"
                        />
                    </div>
                    <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Filter className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {complaints.map((complaint) => (
                            <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-sm font-mono text-gray-500">#{complaint.id}</td>
                                <td className="p-4 text-sm font-medium text-text-light dark:text-text-dark">{complaint.title}</td>
                                <td className="p-4 text-sm text-gray-500">{complaint.date}</td>
                                <td className="p-4">
                                    <StatusBadge status={complaint.status} />
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve/Resolve">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-center">
                <button className="text-sm text-brand-primary font-medium hover:underline">View All Complaints</button>
            </div>
        </div>
    );
};

export default ManageComplaints;
