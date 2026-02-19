import React from 'react';

const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
