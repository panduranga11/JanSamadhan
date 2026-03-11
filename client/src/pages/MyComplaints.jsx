import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getComplaints } from '../services/complaintService';
import ComplaintCard from '../components/ComplaintCard';
import { Loader2, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MyComplaints = () => {
    const { t } = useTranslation();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const data = await getComplaints({ mine: true });
            // Backend returns { complaints: [...] }
            setComplaints(Array.isArray(data) ? data : (data?.complaints || []));
        } catch (error) {
            console.error('Failed to load complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = filter === 'All' 
        ? complaints 
        : complaints.filter(c => c.status === filter);

    if (loading) return <div className="flex justify-center items-center h-full pt-20"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                <div>
                    <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">{t('complaint.myComplaints')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('complaint.raiseSubtitle')}</p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="All">{t('complaint.allStatuses')}</option>
                        <option value="Pending">{t('complaint.pending')}</option>
                        <option value="In Progress">{t('complaint.inProgress')}</option>
                        <option value="Resolved">{t('complaint.resolved')}</option>
                    </select>
                </div>
            </div>

            {filteredComplaints.length === 0 ? (
                <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t('complaint.noComplaints')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComplaints.map((complaint) => (
                        <ComplaintCard key={complaint.id} complaint={complaint} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyComplaints;
