import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
