import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  LogOut, 
  Building2, 
  User, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children, activeTab = 'overview' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">SUPER ADMIN</span>;
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 border border-brand-200">COLLEGE ADMIN</span>;
      case 'STAFF':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">DEPT STAFF</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">STUDENT</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Grievio</span>
            </Link>

            {user?.institution_name && (
              <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs font-semibold text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span className="truncate max-w-[200px]">{user.institution_name}</span>
                <span className="text-slate-400">({user.institution_code})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getRoleBadge(user?.role)}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => logout().then(() => navigate('/login'))}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
