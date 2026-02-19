import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Mock auth check - in real app, use AuthContext or similar
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const isAuth = isAuthenticated();
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userRole = user?.role || 'user'; 

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
         return <Navigate to="/" replace />; // Or unauthorized page
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
