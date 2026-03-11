import React, { useState, useEffect } from 'react';
import { getAllComplaints, updateComplaintStatus } from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import { Search, Filter, ChevronDown, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const ManageComplaints = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const dept = user?.department;
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchComplaints = () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        getAllComplaints(params)
            .then((res) => setComplaints(res.complaints || []))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchComplaints();
    }, [statusFilter]);

    const handleStatusChange = async (complaintId, newStatus) => {
        setUpdatingId(complaintId);
        try {
            await updateComplaintStatus(complaintId, { status: newStatus });
            fetchComplaints();
        } catch (e) {
            alert(e.message);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Department scope banner */}
            {!isSuperAdmin && dept && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Building2 size={15} />
                    Showing only <strong>{dept}</strong> department complaints.
                </div>
            )}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Manage Complaints</h1>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
                            className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-brand-primary outline-none w-full"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-brand-primary outline-none appearance-none"
                        >
                            <option value="">All Status</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Filter className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {error && <p className="p-4 text-sm text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Update Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
                            </td></tr>
                        ) : complaints.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No complaints found.</td></tr>
                        ) : (
                            complaints.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4 text-sm font-medium text-text-light dark:text-text-dark max-w-[200px] truncate">{c.title}</td>
                                    <td className="p-4 text-sm text-gray-500">{c.user_name || '—'}</td>
                                    <td className="p-4 text-sm text-gray-500">{c.category_name || '—'}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="p-4"><StatusBadge status={c.status} /></td>
                                    <td className="p-4 text-right">
                                        <div className="relative inline-block">
                                            <select
                                                disabled={updatingId === c.id}
                                                value={c.status}
                                                onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                                className="text-xs pl-2 pr-6 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg border-none focus:ring-1 focus:ring-brand-primary outline-none appearance-none cursor-pointer"
                                            >
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {updatingId === c.id ? (
                                                <Loader2 className="absolute right-1 top-1.5 w-3 h-3 animate-spin pointer-events-none" />
                                            ) : (
                                                <ChevronDown className="absolute right-1 top-1.5 w-3 h-3 text-gray-400 pointer-events-none" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
};

export default ManageComplaints;
