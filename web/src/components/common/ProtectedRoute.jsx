import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading, isApproved } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs font-medium text-slate-500">Verifying campus credentials...</p>
      </div>
    );
  }

  // 1. Not authenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Not approved and not superadmin -> redirect to pending approval screen
  if (!isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // 3. Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's corresponding dashboard
    let target = '/';
    if (user.role === 'STUDENT') target = '/student/dashboard';
    else if (user.role === 'STAFF') target = '/staff/dashboard';
    else if (user.role === 'ADMIN') target = '/admin/dashboard';
    else if (user.role === 'SUPERADMIN') target = '/superadmin/dashboard';

    return <Navigate to={target} replace />;
  }

  return children;
}
