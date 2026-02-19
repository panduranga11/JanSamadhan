import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
    const { currentLanguage, changeLanguage } = useLanguage();

    return (
        <div className="flex bg-gray-100 rounded-lg p-1 space-x-1 border border-gray-200">
            <button 
                onClick={() => changeLanguage('en')} 
                className={`px-2 py-1 text-xs rounded-md transition-all font-medium ${
                    currentLanguage === 'en' 
                        ? 'bg-white text-brand-primary shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
                EN
            </button>
            <button 
                onClick={() => changeLanguage('hi')} 
                className={`px-2 py-1 text-xs rounded-md transition-all font-medium ${
                    currentLanguage === 'hi' 
                        ? 'bg-white text-brand-primary shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
            >
                HI
            </button>
        </div>
    );
};

export default LanguageSwitcher;
