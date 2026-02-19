import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Amit Verma',
        role: 'Resident, Sector 12',
        comment: 'My streetlight issue was resolved in just 3 days! The tracking feature is really helpful.',
        rating: 5,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit'
    },
    {
        name: 'Sneha Gupta',
        role: 'College Student',
        comment: 'I love the public chat feature. It feels good to connect with neighbors and discuss solutions.',
        rating: 4,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha'
    },
    {
        name: 'Rajesh Kumar',
        role: 'Shop Owner',
        comment: 'Very easy to use app. Raised a complaint about garbage collection and it was cleared the next morning.',
        rating: 5,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-white relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 -z-10 rounded-l-full"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Citizen Stories</h2>
                    <p className="text-lg text-gray-500">Don't just take our word for it. Hear from people like you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-300 transform hover:-translate-y-2"
                        >
                            <div className="flex items-center gap-1 mb-6 text-yellow-500">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={18} fill="currentColor" stroke="none" className="motion-safe:animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                ))}
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.comment}"</p>
                            <div className="flex items-center gap-4">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-md" />
                                <div>
                                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
