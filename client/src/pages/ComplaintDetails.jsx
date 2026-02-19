import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Calendar, MapPin, User, Building2, CheckCircle, Clock, AlertCircle, 
    ArrowLeft, MessageSquare, Edit2, Trash2, Shield, Send, Camera 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock Data for a single complaint
const mockComplaint = {
    id: "GRV-2024-1023",
    title: "Street Light Broken in Sector 4",
    description: "The street light near the main park entrance has been flickering for a week and is now completely off. It causes visibility issues at night for pedestrians. Please fix it urgently as it's a safety concern.",
    status: "In Progress",
    department: "Electricity Department",
    date: "Feb 18, 2024",
    location: "Sector 4 Main Park, Near Gate 2",
    admin: "Rajesh Gupta (Junior Engineer)",
    images: [
        "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=400"
    ],
    timeline: [
        { status: "Complaint Submitted", date: "Feb 18, 10:00 AM", completed: true },
        { status: "Assigned to Electrical Dept", date: "Feb 18, 02:00 PM", completed: true },
        { status: "Technician Assigned", date: "Feb 19, 09:30 AM", completed: true },
        { status: "Inspection Pending", date: "Expected Feb 20", completed: false },
        { status: "Resolved", date: "-", completed: false }
    ],
    updates: [
        {
            user: "Admin (Rajesh Gupta)",
            action: "Technician Assigned",
            note: "Assigned to Technician Suresh Kumar. He will visit tomorrow morning.",
            time: "Feb 19, 09:30 AM"
        },
        {
            user: "System",
            action: "Status Changed",
            note: "Status changed from 'Pending' to 'In Progress'.",
            time: "Feb 18, 02:00 PM"
        }
    ]
};

const ComplaintDetails = () => {
    const { id } = useParams();
    const { user } = useAuth(); // To check if user is admin or owner
    const [complaint, setComplaint] = useState(mockComplaint);
    const [detailsOpen, setDetailsOpen] = useState(true);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Back Navigation */}
            <Link to="/my-complaints" className="inline-flex items-center text-gray-500 hover:text-brand-primary transition-colors">
                <ArrowLeft size={18} className="mr-1" /> Back to My Complaints
            </Link>

            {/* 1. Header Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                            </span>
                            <span className="text-sm text-gray-400 font-mono">#{complaint.id}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">{complaint.title}</h1>
                    </div>
                    {/* Role Based Actions (Mock) */}
                    <div className="flex gap-3">
                         {user?.role === 'admin' ? (
                             <button className="bg-brand-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-primaryDark transition-colors">
                                 Update Status
                             </button>
                         ) : (
                             <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                 <Edit2 size={16} /> Edit
                             </button>
                         )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-lg"><Calendar size={18} /></div>
                        <div>
                            <p className="text-gray-400 text-xs">Date Submitted</p>
                            <p className="font-semibold">{complaint.date}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-lg"><Building2 size={18} /></div>
                        <div>
                            <p className="text-gray-400 text-xs">Department</p>
                            <p className="font-semibold">{complaint.department}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-lg"><User size={18} /></div>
                        <div>
                            <p className="text-gray-400 text-xs">Assigned to</p>
                            <p className="font-semibold">{complaint.admin || "Unassigned"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Description & Updates */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 2. Full Description */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                    >
                         <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
                             Complaint Details
                         </h2>
                         
                         <div className="prose max-w-none text-gray-600 leading-relaxed mb-6">
                             <p>{complaint.description}</p>
                         </div>

                         {/* Images */}
                         {complaint.images.length > 0 && (
                             <div className="mb-6">
                                 <h3 className="text-sm font-bold text-gray-700 mb-3">Attached Images</h3>
                                 <div className="flex gap-4 overflow-x-auto pb-2">
                                     {complaint.images.map((img, idx) => (
                                         <img key={idx} src={img} alt="Evidence" className="h-32 w-auto rounded-lg border border-gray-200 object-cover" />
                                     ))}
                                 </div>
                             </div>
                         )}

                         {/* Location */}
                         <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                             <MapPin className="text-red-500 mt-1 shrink-0" size={20} />
                             <div>
                                 <p className="font-semibold text-gray-800">Location</p>
                                 <p className="text-sm text-gray-600">{complaint.location}</p>
                                 {/* Mock Map Placeholder */}
                                 <div className="mt-3 w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                     Google Maps Embed Placeholder
                                 </div>
                             </div>
                         </div>
                    </motion.div>

                    {/* 4. Admin Updates */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            Activity Log
                        </h2>

                        <div className="space-y-6">
                            {complaint.updates.map((update, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Shield size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-gray-900">{update.user}</span>
                                            <span className="text-xs text-gray-400">• {update.time}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{update.action}</p>
                                        <p className="text-sm text-gray-500 mt-1">{update.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                         {/* Add Comment Input (For User/Admin) */}
                         <div className="mt-8 pt-6 border-t border-gray-100">
                             <div className="flex gap-3">
                                 <input 
                                     type="text" 
                                     placeholder="Add a comment or update..." 
                                     className="flex-1 bg-gray-50 border-transparent rounded-lg px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                 />
                                 <button className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                                     <Send size={18} />
                                 </button>
                             </div>
                         </div>
                    </motion.div>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-1">
                     {/* 3. Status Timeline */}
                     <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24"
                    >
                        <h3 className="font-bold text-gray-900 mb-6">Status Timeline</h3>
                        <div className="space-y-6 relative">
                             {/* Vertical Line */}
                             <div className="absolute top-2 bottom-2 left-3.5 w-0.5 bg-gray-100 -z-10"></div>

                             {complaint.timeline.map((event, idx) => (
                                 <div key={idx} className="flex gap-4 relative">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                         event.completed 
                                            ? 'bg-green-50 border-green-500 text-green-600' 
                                            : 'bg-white border-gray-200 text-gray-300'
                                     }`}>
                                         {event.completed ? <CheckCircle size={14} /> : <Clock size={14} />}
                                     </div>
                                     <div className={`${event.completed ? 'opacity-100' : 'opacity-50'}`}>
                                         <p className="text-sm font-bold text-gray-900">{event.status}</p>
                                         <p className="text-xs text-gray-500">{event.date}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>

                        {/* Action Box if Resolved */}
                         {complaint.status === 'Resolved' && (
                             <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                                 <p className="text-green-800 font-bold mb-2">Complaint Resolved!</p>
                                 <p className="text-xs text-green-600 mb-3">Please rate your experience.</p>
                                 <div className="flex justify-center gap-1 text-yellow-400">
                                     {[1,2,3,4,5].map(s => <span key={s} className="cursor-pointer">★</span>)}
                                 </div>
                             </div>
                         )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
