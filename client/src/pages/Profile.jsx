import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { User, Mail, Phone, MapPin, Save, Loader2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getUserProfile();
            setUser(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUserProfile(formData);
            setUser(formData);
            setEditing(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden border border-border-light dark:border-border-dark"
            >
                <div className="bg-brand-primary h-32 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500">
                            {user?.full_name?.charAt(0) || '?'}
                        </div>
                    </div>
                    <div className="absolute top-4 right-4">
                        {!editing ? (
                            <button 
                                onClick={() => setEditing(true)}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center backdrop-blur-sm transition-colors"
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> {t('common.edit')}
                            </button>
                        ) : (
                             <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-white text-brand-primary px-4 py-2 rounded-lg flex items-center shadow-lg hover:bg-gray-100 transition-colors"
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                                {t('profile.saveChanges')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-20 px-8 pb-8">
                    <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-1">{user?.full_name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{user?.role === 'admin' ? 'Administrator' : 'Citizen'}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <label className="text-sm font-medium text-gray-500 mb-1 block">{t('profile.fullName')}</label>
                                <div className="flex items-center text-text-light dark:text-text-dark">
                                    <User className="w-5 h-5 mr-3 text-brand-primary" />
                                    {editing ? (
                                        <input 
                                            name="full_name" 
                                            value={formData.full_name || ''} 
                                            onChange={handleChange}
                                            className="bg-transparent border-b border-gray-300 focus:border-brand-primary outline-none w-full"
                                        />
                                    ) : (
                                        <span className="text-lg">{user?.full_name}</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <label className="text-sm font-medium text-gray-500 mb-1 block">{t('profile.email')}</label>
                                <div className="flex items-center text-text-light dark:text-text-dark">
                                    <Mail className="w-5 h-5 mr-3 text-brand-primary" />
                                    <span className="text-lg">{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <label className="text-sm font-medium text-gray-500 mb-1 block">{t('profile.phone')}</label>
                                <div className="flex items-center text-text-light dark:text-text-dark">
                                    <Phone className="w-5 h-5 mr-3 text-brand-primary" />
                                    {editing ? (
                                        <input 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleChange}
                                            placeholder={t('profile.phonePlaceholder')}
                                            className="bg-transparent border-b border-gray-300 focus:border-brand-primary outline-none w-full"
                                        />
                                    ) : (
                                        <span className="text-lg">{user?.phone || t('profile.phonePlaceholder')}</span>
                                    )}
                                </div>
                            </div>

                             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <label className="text-sm font-medium text-gray-500 mb-1 block">{t('profile.address')}</label>
                                <div className="flex items-center text-text-light dark:text-text-dark">
                                    <MapPin className="w-5 h-5 mr-3 text-brand-primary" />
                                    {editing ? (
                                        <input 
                                            name="address" 
                                            value={formData.address} 
                                            onChange={handleChange}
                                            placeholder={t('profile.addressPlaceholder')}
                                            className="bg-transparent border-b border-gray-300 focus:border-brand-primary outline-none w-full"
                                        />
                                    ) : (
                                        <span className="text-lg">{user?.address || t('profile.addressPlaceholder')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
