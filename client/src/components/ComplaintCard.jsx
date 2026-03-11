import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';

const ComplaintCard = ({ complaint }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
        >
            <div className="flex justify-between items-start mb-3">
                <StatusBadge status={complaint.status} />
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : complaint.date}
                </span>
            </div>
            
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2 line-clamp-1">
                {complaint.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {complaint.description}
            </p>
            
            <div className="flex justify-between items-center mt-auto">
                 <div className="text-xs text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {complaint.location || 'Unknown Location'}
                </div>
                <Link 
                    to={`/complaint/${complaint.id}`}
                    className="text-sm font-medium text-brand-primary hover:text-brand-primaryDark hover:underline"
                >
                    View Details
                </Link>
            </div>
        </motion.div>
    );
};

export default ComplaintCard;
