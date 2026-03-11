import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import OAuthCallback from '../pages/OAuthCallback';

// User Pages
import Profile from '../pages/Profile';
import RaiseComplaint from '../pages/RaiseComplaint';
import MyComplaints from '../pages/MyComplaints';
import Chat from '../pages/Chat';
import ComplaintDetails from '../pages/ComplaintDetails';
import Notifications from '../pages/Notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageComplaints from '../pages/admin/ManageComplaints';
import ManageAdmins from '../pages/admin/ManageAdmins';
import Users from '../pages/admin/Users';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Google OAuth callback — public, no auth guard needed */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* User Protected Area */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}><MainLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/raise-complaint" element={<RaiseComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Admin Area */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="complaints" element={<ManageComplaints />} />
        <Route path="users" element={<Users />} />
        {/* Super admin only */}
        <Route path="admins" element={<ProtectedRoute allowedRoles={['super_admin']}><ManageAdmins /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

