import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Trash2, Edit2, X, Loader2, CheckCircle,
    XCircle, Shield, Search, RefreshCw
} from 'lucide-react';
import {
    listAdmins, createAdmin, updateAdmin, deleteAdmin
} from '../../services/superAdminService';

const DEPARTMENTS = [
    'Roads & Transport', 'Electricity', 'Water Supply',
    'Sanitation & Garbage', 'General Administration', 'Other'
];

const StatusBadge = ({ status }) => {
    const styles = {
        active:   'bg-green-100 text-green-700',
        inactive: 'bg-yellow-100 text-yellow-700',
        banned:   'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const emptyForm = { full_name: '', email: '', password: '', department: '', status: 'active' };

const ManageAdmins = () => {
    const [admins, setAdmins]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [modal, setModal]         = useState(null); // null | 'create' | 'edit'
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm]           = useState(emptyForm);
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState('');
    const [toast, setToast]         = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const load = async () => {
        setLoading(true);
        try {
            const data = await listAdmins();
            setAdmins(Array.isArray(data) ? data : (data?.admins || []));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setForm(emptyForm); setModal('create'); setError(''); };
    const openEdit   = (admin) => {
        setEditTarget(admin);
        setForm({ full_name: admin.full_name, email: admin.email, password: '', department: admin.department || '', status: admin.status });
        setModal('edit');
        setError('');
    };
    const closeModal = () => { setModal(null); setEditTarget(null); setForm(emptyForm); setError(''); };

    const handleSave = async () => {
        if (!form.full_name.trim() || !form.email.trim()) return setError('Name and email are required.');
        if (modal === 'create' && !form.password.trim()) return setError('Password is required for new admins.');
        setSaving(true); setError('');
        try {
            if (modal === 'create') {
                await createAdmin({
                    fullName:   form.full_name,
                    email:      form.email,
                    password:   form.password,
                    department: form.department,
                });
                showToast('Admin created successfully!');
            } else {
                const payload = { department: form.department, status: form.status };
                await updateAdmin(editTarget.id, payload);
                showToast('Admin updated successfully!');
            }
            closeModal();
            load();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (admin) => {
        if (!window.confirm(`Delete admin "${admin.full_name}"? This cannot be undone.`)) return;
        try {
            await deleteAdmin(admin.id);
            showToast('Admin deleted.');
            load();
        } catch (e) {
            alert(e.message);
        }
    };

    const filtered = admins.filter((a) =>
        a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.department?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium"
                    >
                        <CheckCircle size={16} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-brand-primary" size={24} /> Manage Admins
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{admins.length} admin account{admins.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={load} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95">
                        <UserPlus size={16} /> Add Admin
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text" placeholder="Search by name, email, or department..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin text-brand-primary" size={28} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Shield size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No admins found</p>
                        <p className="text-sm mt-1">Click "Add Admin" to create one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filtered.map((admin) => (
                                    <motion.tr key={admin.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                    {admin.full_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{admin.full_name}</p>
                                                    <p className="text-xs text-gray-400">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{admin.department || <span className="text-gray-300 italic">—</span>}</td>
                                        <td className="px-6 py-4"><StatusBadge status={admin.status} /></td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">{new Date(admin.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(admin)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors">
                                                    <Edit2 size={15} />
                                                </button>
                                                <button onClick={() => handleDelete(admin)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {modal === 'create' ? '➕ Add New Admin' : '✏️ Edit Admin'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {modal === 'create' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                                            <input type="text" value={form.full_name}
                                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                                placeholder="e.g. Rajesh Kumar"
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email *</label>
                                            <input type="email" value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="admin@example.com"
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password *</label>
                                            <input type="password" value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                placeholder="Min 8 characters"
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 dark:text-white"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Department</label>
                                    <select value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 dark:text-white"
                                    >
                                        <option value="">— Select Department —</option>
                                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {modal === 'edit' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                                        <select value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 dark:text-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="banned">Banned</option>
                                        </select>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">
                                        <XCircle size={14} className="shrink-0" /> {error}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white text-sm font-bold shadow-md shadow-brand-primary/20 disabled:opacity-60 flex items-center gap-2 transition-all">
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {modal === 'create' ? 'Create Admin' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageAdmins;
