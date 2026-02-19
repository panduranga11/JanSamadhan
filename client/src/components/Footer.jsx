import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                             <span className="font-bold text-2xl tracking-tighter text-brand-primary">
                                Jan<span className="text-gray-900">Samadhan</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Empowering citizens to build better communities. A transparent platform for resolving public issues and connecting with authorities.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors">
                                <Linkedin size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="text-gray-500 hover:text-brand-primary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-gray-500 hover:text-brand-primary transition-colors">About Us</Link></li>
                            <li><Link to="/raise-complaint" className="text-gray-500 hover:text-brand-primary transition-colors">Raise Complaint</Link></li>
                            <li><Link to="/chat" className="text-gray-500 hover:text-brand-primary transition-colors">Public Chat</Link></li>
                            <li><Link to="/login" className="text-gray-500 hover:text-brand-primary transition-colors">Login / Register</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-6">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/privacy" className="text-gray-500 hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-brand-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/cookie-policy" className="text-gray-500 hover:text-brand-primary transition-colors">Cookie Policy</Link></li>
                            <li><Link to="/admin" className="text-gray-500 hover:text-brand-primary transition-colors">Admin Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-gray-500">
                                <MapPin size={18} className="text-brand-primary shrink-0 mt-0.5" />
                                <span>123 Civic Center Drive,<br />Smart City, SC 45001</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Phone size={18} className="text-brand-primary shrink-0" />
                                <span>+91 1800-123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Mail size={18} className="text-brand-primary shrink-0" />
                                <span>support@jansamadhan.gov.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                     <p className="text-sm text-gray-400">
                        &copy; {currentYear} JanSamadhan. All rights reserved.
                     </p>
                     <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Made with ❤️ for the community</span>
                     </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
