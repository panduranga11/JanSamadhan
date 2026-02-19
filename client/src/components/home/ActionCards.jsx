import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, MessageSquare, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
    {
        title: 'Raise Complaint',
        desc: 'Report issues like sanitation, roads, or water supply.',
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        link: '/raise-complaint'
    },
    {
        title: 'Track Complaint',
        desc: 'Check live status of your reported grievances.',
        icon: Search,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        link: '/my-complaints'
    },
    {
        title: 'Public Chat',
        desc: 'Discuss local issues with other citizens.',
        icon: MessageSquare,
        color: 'text-green-600',
        bg: 'bg-green-50',
        link: '/chat'
    },
    {
        title: 'View Departments',
        desc: 'Explore various civic departments and their roles.',
        icon: Building2,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        link: '/about' // Placeholder link
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

const ActionCards = () => {
    return (
        <section className="py-12 -mt-20 relative z-10 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {actions.map((action, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                        >
                            <Link 
                                to={action.link} 
                                className="group block bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-brand-primary/20 transition-all duration-300 border border-gray-100 hover:border-brand-primary/30 h-full transform hover:-translate-y-2"
                            >
                                <div className={`w-14 h-14 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <action.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    {action.desc}
                                </p>
                                <div className="flex items-center text-brand-primary font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Get Started <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ActionCards;
