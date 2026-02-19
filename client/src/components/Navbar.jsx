import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Raise Complaint', path: '/raise-complaint' },
    // { name: 'Track Complaint', path: '/my-complaints' }, // Merged into Dashboard for users
    { name: 'Public Chat', path: '/chat' },
    { name: 'About', path: '/about' },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 text-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-tighter text-brand-primary">
                Jan<span className="text-gray-900">Samadhan</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(link.path) ? 'text-brand-primary bg-brand-primary/5' : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />

              {/* Auth Logic */}
              {!user ? (
                  <div className="flex items-center gap-3">
                    <Link to="/login" className="text-gray-600 hover:text-brand-primary font-medium text-sm px-3 py-2">
                        Log In
                    </Link>
                    <Link to="/register" className="bg-brand-primary hover:bg-brand-primaryDark text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95">
                        Get Started
                    </Link>
                  </div>
              ) : (
                 <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 hover:border-brand-primary/30 transition-all bg-white"
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-gray-50">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Signed in as</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                </div>
                                
                                <Link to={user.role === 'admin' ? "/admin" : "/active-complaints"} onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary">
                                    Dashboard
                                </Link>
                                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary">
                                    Profile Settings
                                </Link>
                                {user.role !== 'admin' && (
                                    <Link to="/my-complaints" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary">
                                        My Complaints
                                    </Link>
                                )}
                                
                                <div className="border-t border-gray-50 mt-2 pt-2">
                                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
              )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 -mr-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        </div>
      </div>

       {/* Mobile Menu Content */}
       <AnimatePresence>
        {isMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
                <div className="px-4 pt-4 pb-6 space-y-2">
                    {navLinks.map((link) => (
                         <Link 
                            key={link.name}
                            to={link.path} 
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 rounded-xl text-base font-medium ${isActive(link.path) ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                         >
                            {link.name}
                        </Link>
                    ))}

                   <div className="border-t border-gray-100 my-4 pt-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">Profile</Link>
                                <Link to="/my-complaints" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50">My Complaints</Link>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">Original Logout</button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 px-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 rounded-xl border border-gray-200 font-bold text-gray-700">
                                    Log In
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20">
                                    Get Started
                                </Link>
                            </div>
                        )}
                   </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
