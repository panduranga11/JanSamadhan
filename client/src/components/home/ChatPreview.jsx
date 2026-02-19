import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const mockMessages = [
    {
        user: "Rahul Sharma",
        initials: "RS",
        color: "bg-blue-100 text-blue-600",
        message: "The street lights in Sector 4 are working now! Thanks for the quick fix.",
        time: "2 mins ago"
    },
    {
        user: "Priya Singh",
        initials: "PS",
        color: "bg-pink-100 text-pink-600",
        message: "Is anyone else facing water drainage issues near the main market?",
        time: "15 mins ago"
    },
    {
        user: "Admin",
        initials: "AD",
        color: "bg-brand-primary text-white",
        message: "We have deployed a team to check the drainage issue. Please submit a formal complaint for tracking.",
        time: "10 mins ago"
    }
];

const ChatPreview = () => {
    return (
        <section className="py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Community Discussions
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Connect with your Neighbors</h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Don't just complain—discuss! Join the public chat to share updates, ask questions, and collaborate with others to improve your locality.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-primary">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Real-time Updates</h4>
                                    <p className="text-sm text-gray-500">Get instant information from peers and officials.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                             <Link 
                                to="/chat"
                                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105"
                            >
                                Join the Discussion <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Right Content (Chat UI mockup) */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-purple-200/20 rounded-3xl transform rotate-3 blur-2xl"></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center relative z-10">
                                <span className="font-bold text-gray-800">Public Chat</span>
                                <span className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    32 Online
                                </span>
                            </div>
                            <motion.div 
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.2 }
                                    }
                                }}
                                className="p-6 space-y-6"
                            >
                                {mockMessages.map((msg, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        variants={{
                                            hidden: { opacity: 0, x: 20 },
                                            show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50 } }
                                        }}
                                        className="flex gap-4 group"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${msg.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            {msg.initials}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-bold text-sm text-gray-900">{msg.user}</span>
                                                <span className="text-xs text-gray-400">{msg.time}</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 leading-relaxed group-hover:bg-gray-100 transition-colors duration-300">
                                                {msg.message}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center relative z-10">
                                <Link to="/chat" className="text-sm font-bold text-brand-primary hover:underline">
                                    View all messages...
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ChatPreview;
