import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard') || location.pathname.includes('/pending-approval');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {!isDashboardRoute && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Role-Protected Dashboards */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
