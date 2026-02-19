import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getComplaints } from '../services/complaintService';
import ComplaintCard from '../components/ComplaintCard';
import ChatWidget from '../components/ChatWidget';
import { Loader2, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch real mock data
                const data = await getComplaints();
                setRecentComplaints(data.slice(0, 3)); // Show top 3
            } catch (error) {
                console.error("Failed to load complaints:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Limit Width Container */}
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-gray-500">Here is what's happening with your neighborhood.</p>
                    </div>
                    <Link to="/raise-complaint" className="bg-brand-primary hover:bg-brand-primaryDark text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 flex items-center">
                        <PlusCircle className="mr-2 h-5 w-5" /> Raise New Complaint
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Recent Complaints</h2>
                            <Link to="/my-complaints" className="text-brand-primary hover:underline text-sm font-medium flex items-center">
                                View All <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" /></div>
                        ) : recentComplaints.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentComplaints.map(complaint => (
                                    <ComplaintCard key={complaint.id} complaint={complaint} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">You haven't raised any complaints yet.</p>
                                <Link to="/raise-complaint" className="text-brand-primary font-bold hover:underline">Raise your first complaint</Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Chat Widget */}
                    <div className="lg:col-span-1">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Quick Support</h2>
                             <Link to="/chat" className="text-brand-primary hover:underline text-sm font-medium flex items-center">
                                Full Screen <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </div>
                        <ChatWidget compact={true} title="Helpline Chat" />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
