import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-white -z-10"></div>
            
            <motion.div 
                animate={{ 
                    y: [0, -20, 0], 
                    opacity: [0.3, 0.5, 0.3] 
                }}
                transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className="absolute top-20 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            ></motion.div>
            
            <motion.div 
                animate={{ 
                    y: [0, 20, 0], 
                    opacity: [0.3, 0.5, 0.3] 
                }}
                transition={{ 
                    duration: 7, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute top-40 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            ></motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold mb-6 hover:bg-brand-primary/20 transition-colors cursor-default">
                            🚀 Empowering Citizens, Transforming Cities
                        </span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight"
                    >
                        Raise Your Voice. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-600">
                            Build Better Communities.
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        A smart complaint management system connecting citizens with authorities. Report issues, track resolutions, and participate in public discussions.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4"
                    >
                        <Link 
                            to="/raise-complaint"
                            className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primaryDark text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-brand-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                        >
                            Raise a Complaint 
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to="/chat"
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 hover:border-brand-primary text-gray-700 hover:text-brand-primary text-lg font-bold rounded-full transition-all hover:bg-gray-50 flex items-center justify-center gap-2 group"
                        >
                            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Join Public Discussion
                        </Link>
                    </motion.div>

                    {/* Stats or Social Proof */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2 hover:text-brand-primary transition-colors cursor-default">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span>10k+ Issues Resolved</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-brand-primary transition-colors cursor-default">
                             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                             <span>Active Community</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
