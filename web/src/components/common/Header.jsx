import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.approval_status === 'PENDING' || user.approval_status === 'REJECTED') return '/pending-approval';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'STAFF') return '/staff/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'SUPERADMIN') return '/superadmin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition">
              Grievio
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-full">
              Enterprise v2.0
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#features" className="hover:text-brand-600 transition">Features</a>
          <a href="#roles" className="hover:text-brand-600 transition">User Roles</a>
          <a href="#workflow" className="hover:text-brand-600 transition">How It Works</a>
          <a href="#institutions" className="hover:text-brand-600 transition">For Colleges</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/20 transition hover:scale-[1.01]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Workspace</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/20 transition hover:scale-[1.01]"
              >
                <span>Get Started</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
