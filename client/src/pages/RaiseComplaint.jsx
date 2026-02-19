import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createComplaint } from '../services/complaintService';
import { Loader2, Upload, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RaiseComplaint = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        title: '', 
        category: '', 
        description: '', 
        location: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createComplaint(formData);
            navigate('/my-complaints');
        } catch (error) {
            console.error('Failed to submit complaint:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-8"
            >
                <div className="mb-8 border-b border-border-light dark:border-border-dark pb-4">
                    <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Raise a Complaint</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Please provide detailed information to help us resolve the issue faster.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Street Light Not Working"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-text-light dark:text-text-dark focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                             <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-text-light dark:text-text-dark focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                             >
                                 <option value="">Select Category</option>
                                 <option value="Roads">Roads & Transport</option>
                                 <option value="Electricity">Electricity</option>
                                 <option value="Water">Water Supply</option>
                                 <option value="Sanitation">Sanitation & Garbage</option>
                                 <option value="Other">Other</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter address or landmark"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-text-light dark:text-text-dark focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                />
                                <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                             </div>
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Describe the issue in detail..."
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-text-light dark:text-text-dark focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                    </div>

                    {/* File Upload Mock */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Photo (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 mb-2 text-brand-primary" />
                            <p className="text-sm">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (MAX. 5MB)</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg flex items-start text-sm">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>By submitting this complaint, you verify that the information provided is accurate and genuine to the best of your knowledge.</p>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Submit Complaint'}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default RaiseComplaint;
