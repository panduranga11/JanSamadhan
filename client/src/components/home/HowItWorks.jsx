import React from 'react';
import { motion } from 'framer-motion';
import { FileText, UserCheck, CheckCircle } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'Submit Complaint',
        desc: 'Fill out the details, attach photos, and submit your grievance easily.',
        icon: FileText
    },
    {
        id: 2,
        title: 'Admin Reviews',
        desc: 'Concerned department verifies the issue and assigns it for resolution.',
        icon: UserCheck
    },
    {
        id: 3,
        title: 'Issue Resolved',
        desc: 'Get notified once the work is done. Rate the service and close the ticket.',
        icon: CheckCircle
    }
];

const HowItWorks = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-base font-bold text-brand-primary uppercase tracking-wide mb-2">Process</h2>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">How It Works</h3>
                    <p className="mt-4 text-lg text-gray-500">Transparency at every step. Track your complaint from submission to resolution.</p>
                </div>

                <motion.div 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        show: {
                            transition: {
                                staggerChildren: 0.3
                            }
                        }
                    }}
                    className="relative grid grid-cols-1 md:grid-cols-3 gap-12"
                >
                     {/* Connecting Line (Desktop) */}
                     <div className="hidden md:block absolute top-[132px] left-[15%] right-[15%] h-1 bg-gray-100 -z-20 overflow-hidden">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            whileInView={{ x: "0%" }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="h-full w-full bg-gradient-to-r from-gray-100 via-brand-primary to-gray-100 opacity-30"
                        ></motion.div>
                     </div>

                    {steps.map((step, index) => (
                        <motion.div 
                            key={step.id}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                            }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className="w-24 h-24 bg-white border-4 border-gray-50 group-hover:border-brand-primary/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/5 z-10 transition-all duration-300 transform group-hover:scale-110">
                                <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-brand-primary/40 transition-shadow">
                                    <step.icon size={32} className="group-hover:rotate-12 transition-transform duration-300" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 left-0 flex justify-center -z-10 opacity-10 font-[200] text-9xl text-gray-900 select-none group-hover:opacity-20 transition-opacity duration-300 scale-100 group-hover:scale-110 transform origin-center">
                                {step.id}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors">{step.title}</h4>
                            <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
