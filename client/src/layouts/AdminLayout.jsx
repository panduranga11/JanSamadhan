import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex bg-background-light dark:bg-background-dark min-h-screen transition-colors">
             {/* Navbar is fixed at top */}
            <Navbar />
            
            <Sidebar isAdmin={true} />
            
            <main className="flex-1 md:ml-64 pt-16 p-6">
                {children || <Outlet />}
            </main>
        </div>
    );
};

export default AdminLayout;
