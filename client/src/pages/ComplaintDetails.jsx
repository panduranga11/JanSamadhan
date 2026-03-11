import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, MapPin, User, Building2, CheckCircle, Clock,
    ArrowLeft, Shield, Loader2, AlertCircle, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getComplaintById, rateComplaint } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';

const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

const ComplaintDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [rated, setRated] = useState(false);

    useEffect(() => {
        getComplaintById(id)
            .then((data) => {
                setComplaint(data?.complaint || data);
                if (data?.complaint?.user_rating) setRated(true);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleRate = async () => {
        if (!rating) return;
        setRatingLoading(true);
        try {
            await rateComplaint(id, { rating, feedback });
            setRated(true);
        } catch (e) {
            alert(e.message);
        } finally {
            setRatingLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
    );

    if (error || !complaint) return (
        <div className="max-w-3xl mx-auto text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Complaint Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'This complaint does not exist or you do not have access.'}</p>
            <Link to="/my-complaints" className="text-brand-primary hover:underline font-medium">← Back to My Complaints</Link>
        </div>
    );

    const currentStep = STATUS_STEPS.indexOf(complaint.status);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <Link to="/my-complaints" className="inline-flex items-center text-gray-500 hover:text-brand-primary transition-colors text-sm">
                <ArrowLeft size={16} className="mr-1" /> Back to My Complaints
            </Link>

            {/* Header */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-border-light dark:border-border-dark">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status={complaint.status} />
                            <span className="text-sm text-gray-400 font-mono">#{complaint.id?.slice(0, 8)}</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-text-light dark:text-text-dark">{complaint.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={16} className="text-brand-primary" />
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin size={16} className="text-brand-primary" />
                        <span className="truncate">{complaint.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Building2 size={16} className="text-brand-primary" />
                        <span>{complaint.category_name || complaint.department || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User size={16} className="text-brand-primary" />
                        <span>{complaint.assigned_admin_name || 'Unassigned'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Description + Images */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-border-light dark:border-border-dark"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-light dark:text-text-dark">
                            <span className="w-1 h-5 bg-brand-primary rounded-full" />
                            Description
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{complaint.description}</p>

                        {/* Images */}
                        {complaint.images?.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Attached Photos</h3>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {complaint.images.map((img, idx) => (
                                        <img key={idx} src={img.image_url || img} alt="Evidence"
                                            className="h-32 w-auto rounded-xl border border-gray-200 dark:border-gray-700 object-cover" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Activity Log */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-border-light dark:border-border-dark"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-light dark:text-text-dark">
                            <span className="w-1 h-5 bg-purple-500 rounded-full" />
                            Activity Log
                        </h2>
                        {complaint.timeline?.length > 0 ? (
                            <div className="space-y-4">
                                {complaint.timeline.map((entry, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <Shield size={14} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-sm text-text-light dark:text-text-dark">{entry.changed_by_name || 'System'}</span>
                                                <span className="text-xs text-gray-400">· {new Date(entry.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status → {entry.status}</p>
                                            {entry.note && <p className="text-sm text-gray-500 mt-0.5">{entry.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No activity yet.</p>
                        )}
                    </motion.div>

                    {/* Rating (if resolved and not yet rated) */}
                    {complaint.status === 'Resolved' && !rated && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
                        >
                            <h3 className="font-bold text-green-800 dark:text-green-300 mb-3">Rate Your Experience</h3>
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button key={s} onClick={() => setRating(s)}>
                                        <Star className={`w-7 h-7 transition-colors ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                rows={2}
                                placeholder="Optional feedback..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary mb-3"
                            />
                            <button
                                disabled={!rating || ratingLoading}
                                onClick={handleRate}
                                className="bg-brand-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-primaryDark disabled:opacity-50 flex items-center gap-2"
                            >
                                {ratingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Submit Rating
                            </button>
                        </motion.div>
                    )}
                    {rated && complaint.status === 'Resolved' && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800 text-center text-green-700 dark:text-green-300 text-sm font-medium">
                            ✅ Thank you for your feedback!
                        </div>
                    )}
                </div>

                {/* Right: Status Timeline */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark sticky top-24"
                    >
                        <h3 className="font-bold text-text-light dark:text-text-dark mb-6">Status Progress</h3>
                        <div className="space-y-6 relative">
                            <div className="absolute top-2 bottom-2 left-3.5 w-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
                            {STATUS_STEPS.map((step, idx) => {
                                const done = idx <= currentStep;
                                return (
                                    <div key={step} className="flex gap-4 relative">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${done ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-300'}`}>
                                            {done ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        </div>
                                        <div className={done ? 'opacity-100' : 'opacity-40'}>
                                            <p className="text-sm font-bold text-text-light dark:text-text-dark">{step}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {complaint.status === 'Rejected' && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-600 flex items-center justify-center shrink-0">
                                        <AlertCircle size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-red-600">Rejected</p>
                                        {complaint.rejection_note && <p className="text-xs text-gray-500 mt-0.5">{complaint.rejection_note}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
