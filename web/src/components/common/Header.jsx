import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ChevronRight, 
  LayoutDashboard, 
  Menu, 
  X, 
  Building2, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.approval_status === 'PENDING' || user.approval_status === 'REJECTED') return '/pending-approval';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'STAFF') return '/staff/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'SUPERADMIN') return '/superadmin/dashboard';
    return '/';
  };

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/?section=${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs transition-all">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="hover:text-brand-600 transition cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('roles')}
            className="hover:text-brand-600 transition cursor-pointer"
          >
            User Roles
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('workflow')}
            className="hover:text-brand-600 transition cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('institutions')}
            className="hover:text-brand-600 transition cursor-pointer flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>For Colleges</span>
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
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

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
            >
              Portal
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2 text-sm font-bold text-slate-700">
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('roles')}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition"
            >
              User Roles & Permissions
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('workflow')}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition"
            >
              How It Works (5-Stage Engine)
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('institutions')}
              className="text-left py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition flex items-center justify-between"
            >
              <span>For Colleges & Code Lookup</span>
              <Building2 className="w-4 h-4 text-brand-600" />
            </button>
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl bg-brand-600 text-center text-xs font-bold text-white shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
