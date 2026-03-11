import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createComplaint, getCategories } from '../services/complaintService';
import { Loader2, Upload, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RaiseComplaint = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        category_id: '', 
        description: '', 
        location: '',
    });
    const [imageFile, setImageFile] = useState(null);

    // Load categories from API on mount
    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch(() => setCategories([]));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Build multipart/form-data
            const form = new FormData();
            form.append('title', formData.title);
            form.append('category_id', formData.category_id);
            form.append('description', formData.description);
            form.append('location', formData.location);
            if (imageFile) form.append('image', imageFile);

            await createComplaint(form);
            setSuccess(true);
            setTimeout(() => navigate('/my-complaints'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to submit complaint. Please try again.');
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

                {success && (
                    <div className="mb-6 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span>Complaint submitted successfully! Redirecting...</span>
                    </div>
                )}
                {error && (
                    <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

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
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-text-light dark:text-text-dark focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
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

                    {/* Real File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Photo (Optional)</label>
                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-cover mb-2" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-2 text-brand-primary" />
                                    <p className="text-sm">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (MAX. 5MB)</p>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept="image/jpeg,image/png,image/svg+xml" 
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                        {imageFile && (
                            <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg flex items-start text-sm">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>By submitting this complaint, you verify that the information provided is accurate and genuine to the best of your knowledge.</p>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading || success}
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
