import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark transition-colors">
            <Navbar />
            <main className="flex-grow pt-16 container mx-auto px-4 py-8">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
