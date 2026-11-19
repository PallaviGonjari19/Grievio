import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import { 
  ShieldCheck, 
  LogOut, 
  Building2, 
  User, 
  Sparkles,
  ChevronRight,
  GraduationCap,
  Wrench,
  ShieldAlert,
  Crown
} from 'lucide-react';

export default function DashboardLayout({ children, activeTab = 'overview', onSelectComplaint }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200/80 shadow-2xs">
            <Crown className="w-3 h-3 text-purple-600" />
            SUPER ADMIN
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-700 border border-indigo-200/80 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            COLLEGE ADMIN
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-800 border border-amber-200/80 shadow-2xs">
            <Wrench className="w-3 h-3 text-amber-600" />
            DEPT STAFF
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            <GraduationCap className="w-3 h-3 text-emerald-600" />
            STUDENT
          </span>
        );
    }
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'GR';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 flex flex-col antialiased">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-brand-600 transition">
                  Grievio
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                  Campus
                </span>
              </div>
            </Link>

            {user?.institution_name && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200/80 text-xs text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Building2 className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold leading-tight">
                    <span className="truncate max-w-[220px]">{user.institution_name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">
                      {user.institution_code}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified Tenant Network
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell onSelectComplaint={onSelectComplaint} />

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-slate-50/80 hover:bg-slate-100/70 py-1.5 px-2.5 rounded-xl border border-slate-200/70 transition">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {getUserInitials()}
              </div>

              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getRoleBadge(user?.role)}
                </div>
              </div>

              <button
                onClick={() => logout().then(() => navigate('/login'))}
                title="Sign Out"
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Grievio Platform &bull; Multi-Tenant Enterprise Campus Governance</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All Services Operational
            </span>
            <span>&bull;</span>
            <span>Zero-Trust Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
