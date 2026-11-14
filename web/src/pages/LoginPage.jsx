import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, Building, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';
  const [selectedRoleTab, setSelectedRoleTab] = useState(initialRole);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Quick test demo accounts seeded in Phase 2
  const demoAccounts = {
    student: { user: 'student_apex', pass: 'Password123!', label: 'Approved Student (Alex Johnson)' },
    pending: { user: 'student_pending', pass: 'Password123!', label: 'Pending Student (Samantha Wright)' },
    staff: { user: 'staff_apex', pass: 'Password123!', label: 'Department Staff (Elena Reyes)' },
    admin: { user: 'apex_admin', pass: 'Password123!', label: 'College Admin (Marcus Vance)' },
    superadmin: { user: 'superadmin', pass: 'Password123!', label: 'Platform Super Admin' },
  };

  const fillDemoCredentials = (accKey) => {
    const acc = demoAccounts[accKey];
    if (acc) {
      setUsername(acc.user);
      setPassword(acc.pass);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      const user = result.user;
      if (user.approval_status === 'PENDING' || user.approval_status === 'REJECTED') {
        navigate('/pending-approval');
      } else if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'SUPERADMIN') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Grievio</h2>
          <p className="text-xs text-slate-500">Access your centralized campus workspace</p>
        </div>

        {/* Demo Account Quick Fill Buttons */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Phase 2 Quick-Test Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-slate-700 font-medium text-left truncate transition"
            >
              🏛️ College Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('student')}
              className="px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-slate-700 font-medium text-left truncate transition"
            >
              🎓 Student (Approved)
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('pending')}
              className="px-2 py-1.5 bg-white hover:bg-amber-50 hover:text-amber-800 border border-amber-200 rounded-lg text-amber-700 font-medium text-left truncate transition"
            >
              ⏳ Student (Pending)
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('staff')}
              className="px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-slate-700 font-medium text-left truncate transition"
            >
              🛠️ Department Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('superadmin')}
              className="col-span-2 px-2 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-slate-700 font-medium text-left truncate transition"
            >
              🌐 Platform Super Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username or Official Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. apex_admin or alex.student@apex.edu"
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          First time on Grievio?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Register with College Code
          </Link>
        </div>
      </div>
    </div>
  );
}
